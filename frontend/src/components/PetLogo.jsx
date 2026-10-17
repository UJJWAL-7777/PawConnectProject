const PetLogo = ({ className = "w-6 h-6 text-current" }) => {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left Outer Toe */}
      <ellipse cx="100" cy="210" rx="38" ry="52" transform="rotate(-25 100 210)" />
      {/* Inner Left Toe */}
      <ellipse cx="200" cy="130" rx="42" ry="58" transform="rotate(-10 200 130)" />
      {/* Inner Right Toe */}
      <ellipse cx="312" cy="130" rx="42" ry="58" transform="rotate(10 312 130)" />
      {/* Right Outer Toe */}
      <ellipse cx="412" cy="210" rx="38" ry="52" transform="rotate(25 412 210)" />
      {/* Main Pad with Heart Silhouette */}
      <path d="M256 210 C 180 210, 120 270, 120 335 C 120 395, 180 435, 256 470 C 332 435, 392 395, 392 335 C 392 270, 332 210, 256 210 Z" />
    </svg>
  );
};

export default PetLogo;
