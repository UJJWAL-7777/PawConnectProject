const Order = require('../models/Order');
const Pet = require('../models/Pet');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// Initialize Stripe if key is provided, or create mock helper
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'mock') {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } catch (err) {
    console.warn('Stripe initialization skipped:', err.message);
  }
}

// @desc    Create order / Initiate Checkout for sale listing
// @route   POST /api/v1/orders
// @access  Private (Adopter/Buyer)
const createOrder = async (req, res, next) => {
  try {
    const {
      petId,
      shippingAddress,
      deliveryOption,
      notes,
      paymentMethod = 'stripe',
    } = req.body;

    const pet = await Pet.findById(petId).populate('ownerId');
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    if (pet.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'This pet is no longer available for purchase',
      });
    }

    const sellerId = pet.ownerId?._id || pet.ownerId;
    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Pet does not have an assigned seller',
      });
    }

    // Disallow buying your own listing
    if (sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot purchase your own pet listing',
      });
    }

    const amount = pet.price || 0;

    // Create the order in MongoDB
    const order = await Order.create({
      buyerId: req.user._id,
      sellerId,
      petId: pet._id,
      amount,
      currency: 'usd',
      paymentStatus: paymentMethod === 'test_mode' ? 'Paid' : 'Pending',
      paymentMethod,
      deliveryOption: deliveryOption || 'Local Pickup',
      shippingAddress: shippingAddress || req.user.address || {},
      buyerContact: {
        phone: req.user.phone,
        email: req.user.email,
      },
      notes: notes || '',
      paidAt: paymentMethod === 'test_mode' ? new Date() : undefined,
    });

    // If paid immediately in test mode, update pet status to Sold
    if (order.paymentStatus === 'Paid') {
      pet.status = 'Sold';
      await pet.save();

      // Add to buyer's adoptedPets collection
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { adoptedPets: pet._id },
      });

      // Send confirmation email
      await sendEmail({
        to: req.user.email,
        subject: `PawConnect: Purchase Confirmed for ${pet.name}! 🎉`,
        text: `Congratulations! Your purchase of ${pet.name} for $${amount} has been processed successfully. Order ID: ${order._id}`,
      });
    }

    // Stripe checkout session creation if configured
    let stripeUrl = null;
    let clientSecret = null;

    if (stripe && paymentMethod === 'stripe') {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `PawConnect Adoption: ${pet.name} (${pet.breed})`,
                  images: pet.photos?.length ? [pet.photos[0]] : [],
                  description: pet.description || 'Pet purchase fee',
                },
                unit_amount: Math.round(amount * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          client_reference_id: order._id.toString(),
          customer_email: req.user.email,
          success_url: `${
            process.env.CLIENT_URL || 'http://localhost:5173'
          }/orders/${order._id}?payment=success`,
          cancel_url: `${
            process.env.CLIENT_URL || 'http://localhost:5173'
          }/pets/${pet._id}?payment=cancelled`,
        });

        order.stripeSessionId = session.id;
        await order.save();
        stripeUrl = session.url;
      } catch (stripeErr) {
        console.warn('Stripe checkout session creation failed, using sandbox fallback:', stripeErr.message);
      }
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('petId', 'name species breed photos price status')
      .populate('sellerId', 'name email phone avatar')
      .populate('buyerId', 'name email phone');

    res.status(201).json({
      success: true,
      message:
        order.paymentStatus === 'Paid'
          ? 'Order completed and payment received!'
          : 'Order created. Complete payment to finalize purchase.',
      data: populatedOrder,
      stripeUrl,
      clientSecret,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm test/mock payment or webhook callback
// @route   POST /api/v1/orders/:id/confirm-payment
// @access  Private
const confirmPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('petId')
      .populate('buyerId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.paymentStatus = 'Paid';
    order.paidAt = new Date();
    await order.save();

    // Update Pet status to Sold
    if (order.petId) {
      await Pet.findByIdAndUpdate(order.petId._id, { status: 'Sold' });
      await User.findByIdAndUpdate(order.buyerId._id, {
        $addToSet: { adoptedPets: order.petId._id },
      });
    }

    // Send confirmation email
    if (order.buyerId?.email) {
      await sendEmail({
        to: order.buyerId.email,
        subject: `PawConnect: Order #${order._id.toString().slice(-6)} Payment Confirmed! 🐾`,
        text: `Your payment of $${order.amount} has been successfully verified. Thank you for welcoming ${order.petId?.name} home!`,
      });
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's placed orders
// @route   GET /api/v1/orders/mine
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id })
      .populate('petId', 'name species breed photos price status')
      .populate('sellerId', 'name email phone avatar')
      .sort('-createdAt');

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders received by seller
// @route   GET /api/v1/orders/received
// @access  Private (Seller, Rescuer, ShelterAdmin, Admin)
const getReceivedOrders = async (req, res, next) => {
  try {
    const query = req.user.role === 'Admin' ? {} : { sellerId: req.user._id };

    const orders = await Order.find(query)
      .populate('petId', 'name species breed photos price status')
      .populate('buyerId', 'name email phone address avatar')
      .sort('-createdAt');

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details
// @route   GET /api/v1/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('petId', 'name species breed photos price status location')
      .populate('sellerId', 'name email phone avatar')
      .populate('buyerId', 'name email phone address');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify participant
    const isBuyer = order.buyerId._id.toString() === req.user._id.toString();
    const isSeller = order.sellerId._id.toString() === req.user._id.toString();
    if (!isBuyer && !isSeller && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  confirmPayment,
  getMyOrders,
  getReceivedOrders,
  getOrderById,
};
