import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Heart,
  FileText,
  Lock,
  ArrowLeft,
} from 'lucide-react';

const TermsEthicsPage = () => {
  const { isDark } = useTheme();

  const prohibitedList = [
    'Wild and exotic big cats (tigers, lions, leopards, jaguars, cheetahs)',
    'Non-human primates (monkeys, chimpanzees, apes, lemurs)',
    'Wild canids (wolves, coyotes, dingoes)',
    'Dangerous wild reptiles (crocodilians, venomous snakes, large constrictors)',
    'Endangered or protected species classified by CITES or national wildlife acts',
    'Puppies or kittens sourced from unlicensed commercial breeding facilities (puppy mills)',
  ];

  const ethicalPrinciples = [
    {
      title: 'Mandatory Seller Verification',
      desc: 'All marketplace pet sellers and breeding profiles must undergo KYC verification and review by platform administrators before any listings can be published.',
    },
    {
      title: 'Health & Medical Transparency',
      desc: 'Sellers and rescuers must disclose accurate age, vaccination history, spay/neuter status, and known behavioral or physical conditions.',
    },
    {
      title: 'Adoption First & Community Rescues',
      desc: 'PawConnect promotes shelter adoptions and operates an open, public rescue dispatch tracker to save lost, stray, and injured animals.',
    },
    {
      title: 'Zero Tolerance for Exploitation',
      desc: 'Listing animals for fighting, prohibited research, or under-age separation from nursing mothers results in immediate account banning and referral to authorities.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10 animate-fade-in">
      
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-amber-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <ShieldAlert className="w-3.5 h-3.5" /> PawConnect Governance
        </div>
        <h1 className="text-3xl sm:text-4xl font-black">Animal Ethics & Terms of Service</h1>
        <p className="text-sm text-slate-400">
          Last revised: October 2026 • Effective nationwide
        </p>
      </div>

      {/* Prohibited Species Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-rose-500/10 border border-rose-500/30 space-y-4">
        <h2 className="text-xl font-bold text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          Prohibited & Banned Species Policy
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          PawConnect strictly forbids the trade, listing, or exchange of wild, dangerous, or endangered animals.
          Our automated keyword filtering and human moderation teams flag and remove any prohibited listing:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-rose-200">
          {prohibitedList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span> {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Ethical Breeding & Adoption Principles */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black">Platform Standards & Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ethicalPrinciples.map((item, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-3xl border space-y-2 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
              }`}
            >
              <h3 className="font-bold text-base flex items-center gap-2 text-amber-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className={`p-6 rounded-3xl border space-y-3 text-xs text-slate-400 leading-relaxed ${
        isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-stone-50 border-stone-200'
      }`}>
        <h3 className="font-bold text-sm text-slate-300">Liability & Adoption Disclaimer</h3>
        <p>
          PawConnect serves as an intermediary platform connecting prospective adopters, buyers, verified sellers,
          and non-profit animal shelters. While PawConnect requires veterinary vaccination documentation and performs
          seller verification, adopters are encouraged to meet animals in person and review independent veterinary checks.
        </p>
        <p>
          If you encounter any suspicious listing, unauthorized breeder, or animal welfare concern, please click the
          "Report Listing" button located on every pet page.
        </p>
      </div>

    </div>
  );
};

export default TermsEthicsPage;
