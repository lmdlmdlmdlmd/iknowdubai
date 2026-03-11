"use client";

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import posthog from 'posthog-js';

const questions = [
  {
    id: 1,
    question: "How many times have you been to Dubai?",
    options: [
      { text: "I live here", points: 10 },
      { text: "Multiple times, I know the vibe", points: 7 },
      { text: "Once for a layover", points: 2 },
      { text: "Never but I read X", points: 0 },
      { text: "Does watching Dubai Bling count?", points: -5 },
    ]
  },
  {
    id: 2,
    question: "Where do you get your Dubai news?",
    options: [
      { text: "I'm literally here, I see it firsthand", points: 10 },
      { text: "Local UAE sources", points: 8 },
      { text: "CNN told me everyone's fleeing", points: 1 },
      { text: "A viral thread with 50k likes", points: -3 },
      { text: "My friend's cousin's WhatsApp group", points: -5 },
    ]
  },
  {
    id: 3,
    question: "What's your current distance from Dubai?",
    options: [
      { text: "0km - I'm literally here", points: 10 },
      { text: "Less than 500km (regional)", points: 6 },
      { text: "7000km+ but very concerned", points: -3 },
      { text: "What's a km? (I'm American)", points: -100, isAmerican: true },
      { text: "Idk but I have strong opinions", points: -10 },
    ]
  },
  {
    id: 4,
    question: "Your takes on regional security are based on:",
    options: [
      { text: "Living through the actual events", points: 10 },
      { text: "Friends/family who are there", points: 7 },
      { text: "International headlines", points: 2 },
      { text: "Vibes and speculation", points: -5 },
      { text: "A thread I didn't even finish reading", points: -10 },
    ]
  },
  {
    id: 5,
    question: "How do you feel about residents saying it's safe?",
    options: [
      { text: "I'm one of them, it IS safe", points: 10 },
      { text: "They probably know better than me", points: 7 },
      { text: "They're coping/in denial", points: -3 },
      { text: "Doesn't matter, I saw a scary headline", points: -7 },
      { text: "They're clearly being paid to say that", points: -15 },
    ]
  }
];

const getResult = (percentage, isAmerican) => {
  if (isAmerican) {
    return {
      title: "Freedom of Speechoooor",
      message: "Sorry, your First Amendment rights don't apply here",
      emoji: "🦅",
      scoreDisplay: "AMERICAN",
      passed: false
    };
  }

  if (percentage >= 80) {
    return {
      title: "Earned Your Opinion",
      message: "You actually know wtf you're talking about",
      emoji: "🏆",
      scoreDisplay: `${percentage}%`,
      passed: true
    };
  } else if (percentage >= 50) {
    return {
      title: "Qualified-ish",
      message: "You've got some context, don't ruin it",
      emoji: "⚠️",
      scoreDisplay: `${percentage}%`,
      passed: false
    };
  } else if (percentage >= 20) {
    return {
      title: "Confidently Wrong",
      message: "The audacity is impressive, the accuracy isn't",
      emoji: "🤡",
      scoreDisplay: `${percentage}%`,
      passed: false
    };
  } else {
    return {
      title: "Certified Bullshitter",
      message: "Ser you're literally just making shit up",
      emoji: "💩",
      scoreDisplay: `${percentage}%`,
      passed: false
    };
  }
};

export default function DubaiQuiz() {
  const [currentSection, setCurrentSection] = useState('hero');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAmerican, setIsAmerican] = useState(false);
  const [score, setScore] = useState(0);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef(null);

  const allAnswered = Object.keys(answers).length === 5;
  const isLastQuestion = currentQuestion === 4;
  const currentAnswered = answers[currentQuestion + 1] !== undefined;

  const handleAnswer = (questionId, points, optionIndex, isAmericanOption = false) => {
    posthog.capture('question_answered', { question_number: questionId, answer_index: optionIndex });
    setAnswers(prev => ({ ...prev, [questionId]: { points, optionIndex } }));
    if (isAmericanOption) {
      setIsAmerican(true);
    } else if (questionId === 3) {
      setIsAmerican(false);
    }
  };

  const goNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    const rawScore = Object.values(answers).reduce((sum, ans) => sum + ans.points, 0);
    const percentage = Math.max(0, Math.round((rawScore / 50) * 100));
    const res = getResult(percentage, isAmerican);
    posthog.capture('quiz_completed', { score: percentage, rating: res.title, is_american: isAmerican });
    setScore(percentage);
    setCurrentSection('results');
  };

  const resetQuiz = () => {
    setAnswers({});
    setIsAmerican(false);
    setScore(0);
    setCurrentQuestion(0);
    setCurrentSection('hero');
  };

  const result = getResult(score, isAmerican);

  const downloadCertificate = async () => {
    posthog.capture('certificate_downloaded');
    setIsDownloading(true);

    try {
      if (certificateRef.current) {
        const canvas = await html2canvas(certificateRef.current, {
          backgroundColor: '#F5EBD7',
          scale: 1,
          width: 1080,
          height: 1350,
          windowWidth: 1080,
          windowHeight: 1350,
        });

        const link = document.createElement('a');
        link.download = 'dubai-opinionist-results.jpg';
        link.href = canvas.toDataURL('image/jpeg', 0.92);
        link.click();
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Try taking a screenshot instead!');
    }

    setIsDownloading(false);
  };

  const shareOnX = () => {
    posthog.capture('shared_on_x', { score, rating: result.title });
    let tweetText = '';

    if (isAmerican) {
      tweetText = `I scored AMERICAN on The Dubai Opinionist Test!\n\nRating: Freedom of Speechoooor 🦅\n\nI don't know what a km is but I have opinions about Dubai.\n\nAre you qualified to post? Take the test: iknowdubai.lol`;
    } else if (score >= 80) {
      tweetText = `I scored ${score}% on The Dubai Opinionist Test!\n\nRating: Earned Your Opinion 🏆\n\nI actually live here. I'm allowed to post.\n\nAre you qualified to post? Take the test: iknowdubai.lol`;
    } else if (score >= 50) {
      tweetText = `I scored ${score}% on The Dubai Opinionist Test!\n\nRating: Qualified-ish ⚠️\n\nMaybe I should post less and listen more.\n\nAre you qualified to post? Take the test: iknowdubai.lol`;
    } else if (score >= 20) {
      tweetText = `I scored ${score}% on The Dubai Opinionist Test!\n\nRating: Confidently Wrong 🤡\n\nI've been posting hot takes from 7000km away.\n\nAre you qualified to post? Take the test: iknowdubai.lol`;
    } else {
      tweetText = `I scored ${score}% on The Dubai Opinionist Test!\n\nRating: Certified Bullshitter 💩\n\nI get my Dubai news from WhatsApp forwards.\n\nAre you qualified to post? Take the test: iknowdubai.lol`;
    }

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
  };

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).toUpperCase();

  const currentQ = questions[currentQuestion];

  // Dynamic certificate title
  const certificateTitle = result.passed ? "CERTIFIED DUBAI OPINIONIST" : "THE DUBAI OPINIONIST TEST";

  const Logo = () => (
    <a
      href="/"
      onClick={(e) => { e.preventDefault(); resetQuiz(); }}
      className="font-archivo logo-text"
      style={{
        color: '#1A0F08',
        fontSize: '18px',
        textDecoration: 'none',
        textTransform: 'lowercase',
        letterSpacing: '-0.01em',
        position: 'relative',
        zIndex: 20,
      }}
    >
      iknowdubai.lol
    </a>
  );

  return (
    <>
      <style>{`
        .font-archivo {
          font-family: 'Archivo Black', sans-serif;
        }

        .font-space {
          font-family: 'Space Mono', monospace;
        }

        /* Large desktop scaling — xl (1280px+) */
        @media (min-width: 1280px) {
          .logo-text { font-size: 20px !important; }
          .hero-subtitle { font-size: clamp(1rem, 2.8vw, 1.6rem) !important; }
          .hero-btn {
            font-size: 16px !important;
            padding: 22px 60px !important;
          }
          .hero-timer { font-size: 14px !important; }
          .quiz-card {
            padding: 28px 26px !important;
            border-width: 5px !important;
          }
          .quiz-label { font-size: 14px !important; }
          .quiz-question { font-size: 1.9rem !important; }
          .quiz-option {
            font-size: 15px !important;
            padding: 14px 18px !important;
          }
          .quiz-nav-btn {
            font-size: 15px !important;
            padding: 18px 36px !important;
          }
          .cert-card {
            padding: 32px 28px !important;
            border-width: 5px !important;
          }
          .cert-label { font-size: 14px !important; }
          .cert-sublabel { font-size: 12px !important; }
          .cert-title { font-size: 2.2rem !important; }
          .cert-score { font-size: 5.5rem !important; }
          .cert-emoji { font-size: 48px !important; }
          .cert-rating { font-size: 3.5rem !important; }
          .cert-message { font-size: 15px !important; }
          .cert-date { font-size: 12px !important; }
          .result-btn {
            font-size: 14px !important;
            padding: 16px 40px !important;
            border-width: 4px !important;
          }
        }

        /* Ultra-wide scaling — 2xl (1536px+) */
        @media (min-width: 1536px) {
          .logo-text { font-size: 22px !important; }
          .hero-subtitle { font-size: clamp(1rem, 2.8vw, 1.8rem) !important; }
          .hero-btn {
            font-size: 17px !important;
            padding: 24px 68px !important;
            border-width: 5px !important;
          }
          .hero-timer { font-size: 15px !important; }
          .quiz-card {
            padding: 36px 32px !important;
            border-width: 6px !important;
          }
          .quiz-label { font-size: 15px !important; }
          .quiz-question { font-size: 2.1rem !important; }
          .quiz-option {
            font-size: 16px !important;
            padding: 16px 22px !important;
            border-width: 4px !important;
          }
          .quiz-nav-btn {
            font-size: 16px !important;
            padding: 20px 44px !important;
            border-width: 4px !important;
          }
          .cert-card {
            padding: 40px 36px !important;
            border-width: 6px !important;
          }
          .cert-label { font-size: 15px !important; }
          .cert-sublabel { font-size: 14px !important; }
          .cert-title { font-size: 2.5rem !important; }
          .cert-score { font-size: 6rem !important; }
          .cert-emoji { font-size: 56px !important; }
          .cert-rating { font-size: 4rem !important; }
          .cert-message { font-size: 16px !important; }
          .cert-date { font-size: 13px !important; }
          .result-btn {
            font-size: 15px !important;
            padding: 18px 48px !important;
          }
        }
      `}</style>

      {/* HERO SECTION */}
      {currentSection === 'hero' && (
        <div
          className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
          style={{
            background: `linear-gradient(180deg,
              #F5EBD7 0%,
              #EDDFCB 25%,
              #E5CBA8 50%,
              #DEBB94 75%,
              #D9A87E 100%
            )`,
          }}
        >
          {/* Gold accent bar */}
          <div
            className="absolute top-0 left-0 w-full"
            style={{ height: '6px', backgroundColor: '#D4AF37' }}
          />

          {/* Logo */}
          <div className="absolute top-5 left-0 w-full flex justify-center" style={{ zIndex: 20 }}>
            <Logo />
          </div>

          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E")`,
              opacity: 0.5,
            }}
          />

          {/* Geometric Desert Dunes */}
          <svg
            className="absolute bottom-0 left-0 w-full"
            style={{ height: '30%', minHeight: '180px' }}
            viewBox="0 0 1440 400"
            preserveAspectRatio="none"
          >
            <polygon
              points="0,400 0,260 200,200 450,250 700,160 950,220 1200,140 1440,180 1440,400"
              fill="#D4A574"
              opacity="0.6"
            />
            <polygon
              points="0,400 0,300 150,260 400,300 650,220 900,280 1150,200 1440,260 1440,400"
              fill="#C9A227"
              opacity="0.65"
            />
            <polygon
              points="0,400 0,340 250,310 500,350 750,290 1000,340 1250,280 1440,320 1440,400"
              fill="#C4884A"
              opacity="0.7"
            />
          </svg>

          {/* Dubai Skyline */}
          <svg
            className="absolute bottom-0 left-0 w-full"
            style={{ height: '28%', minHeight: '170px' }}
            viewBox="0 0 1440 300"
            preserveAspectRatio="xMidYMax slice"
          >
            <g fill="#2A1810" opacity="0.95">
              <polygon points="720,20 725,20 730,280 710,280" />
              <polygon points="715,38 725,38 728,280 712,280" />
              <polygon points="710,65 730,65 735,280 705,280" />
              <polygon points="705,100 735,100 742,280 698,280" />
              <polygon points="698,145 742,145 750,280 690,280" />

              <path d="M280,280 L280,140 Q320,105 360,140 L360,280 Z" />
              <rect x="290" y="150" width="60" height="130" />

              <polygon points="500,280 500,120 510,100 520,120 520,280" />
              <polygon points="540,280 540,140 550,120 560,140 560,280" />

              <polygon points="900,280 895,170 905,160 915,170 910,280" />
              <polygon points="920,280 918,180 928,170 938,180 935,280" />

              <rect x="800" y="195" width="30" height="85" />
              <polygon points="800,195 815,160 830,195" />

              <rect x="1050" y="120" width="15" height="160" />
              <rect x="1115" y="120" width="15" height="160" />
              <rect x="1050" y="120" width="80" height="18" />

              <rect x="120" y="230" width="20" height="50" />
              <rect x="150" y="210" width="25" height="70" />
              <rect x="180" y="190" width="20" height="90" />
              <rect x="205" y="215" width="30" height="65" />

              <rect x="1200" y="200" width="25" height="80" />
              <rect x="1230" y="180" width="20" height="100" />
              <rect x="1260" y="205" width="35" height="75" />
              <rect x="1300" y="225" width="25" height="55" />
              <rect x="1340" y="240" width="30" height="40" />

              <rect x="600" y="210" width="20" height="70" />
              <rect x="625" y="190" width="25" height="90" />
              <rect x="655" y="220" width="18" height="60" />
              <rect x="760" y="210" width="22" height="70" />
              <rect x="980" y="200" width="20" height="80" />
              <rect x="1005" y="220" width="25" height="60" />

              <rect x="0" y="260" width="1440" height="40" />
              <rect x="80" y="250" width="90" height="30" />
              <rect x="400" y="248" width="65" height="32" />
              <rect x="1100" y="252" width="75" height="28" />
            </g>
          </svg>

          {/* Satire Disclaimer — solid brown bar below buildings */}
          <div
            className="absolute bottom-0 left-0 w-full font-space"
            style={{
              backgroundColor: 'rgba(42, 24, 16, 0.95)',
              fontSize: '11px',
              color: '#F5EBD7',
              opacity: 0.85,
              textAlign: 'center',
              padding: '8px 20px 10px',
              lineHeight: 1.45,
              zIndex: 5,
            }}
          >
            This is satire. For entertainment purposes only. Your results mean nothing. Please don't take this seriously.
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center">
            <h1
              className="font-archivo text-center mb-3 sm:mb-6"
              style={{
                color: '#1A0F08',
                fontSize: 'clamp(2rem, 8vw, 5.5rem)',
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                textShadow: '3px 3px 0 rgba(212, 175, 55, 0.2)',
              }}
            >
              ARE YOU A<br />
              CERTIFIED DUBAI<br />
              OPINIONIST?
            </h1>

            <p
              className="font-space text-center mb-5 sm:mb-10 hero-subtitle"
              style={{
                color: '#2A1810',
                fontSize: 'clamp(1rem, 2.8vw, 1.4rem)',
                fontWeight: 700,
              }}
            >
              Prove you&#39;re qualified to have an opinion about Dubai
            </p>

            <button
              onMouseEnter={() => setHoveredButton('start')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => { posthog.capture('quiz_started'); setCurrentSection('quiz'); }}
              className="font-space mb-5 hero-btn"
              style={{
                backgroundColor: '#7CB3BD',
                color: '#1A0F08',
                padding: '20px 52px',
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                border: '4px solid #2A1810',
                borderRadius: 0,
                cursor: 'pointer',
                transform: hoveredButton === 'start' ? 'translate(-4px, -4px)' : 'translate(0, 0)',
                boxShadow: hoveredButton === 'start' ? '4px 4px 0 #2A1810' : 'none',
                transition: 'none',
              }}
            >
              START TEST
            </button>

            <p
              className="font-space hero-timer"
              style={{
                color: '#2A1810',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                background: 'rgba(245, 235, 215, 0.8)',
                padding: '4px 12px',
                borderRadius: '2px',
              }}
            >
              ⏱ 3 MIN · HONESTY REQUIRED
            </p>
          </div>

                  </div>
      )}

      {/* QUIZ SECTION */}
      {currentSection === 'quiz' && (
        <div
          className="min-h-screen flex flex-col items-center justify-start sm:justify-center px-6 pt-[85px] sm:pt-12 pb-6 sm:pb-12 relative"
          style={{
            background: `linear-gradient(180deg,
              #F5EBD7 0%,
              #EDDFCB 50%,
              #E5CBA8 100%
            )`,
          }}
        >
          {/* Gold accent bar */}
          <div
            className="absolute top-0 left-0 w-full"
            style={{ height: '6px', backgroundColor: '#D4AF37' }}
          />

          {/* Logo */}
          <div className="absolute top-5 left-0 w-full flex justify-center" style={{ zIndex: 20 }}>
            <Logo />
          </div>

          <div className="max-w-xl xl:max-w-[600px] 2xl:max-w-[700px] w-full">
            {/* Progress dots */}
            <div className="flex justify-center gap-3 mb-4 sm:mb-8">
              {questions.map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: index === currentQuestion
                      ? '#2A1810'
                      : answers[index + 1]
                        ? '#7CB3BD'
                        : 'transparent',
                    border: '2px solid #2A1810',
                  }}
                />
              ))}
            </div>

            {/* Question Card */}
            <div
              className="quiz-card"
              style={{
                backgroundColor: '#F5EBD7',
                border: '4px solid #2A1810',
                padding: '20px 18px',
              }}
            >
              <p
                className="font-space mb-2 quiz-label"
                style={{
                  color: '#2A1810',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                }}
              >
                QUESTION {currentQuestion + 1} OF 5
              </p>

              <h3
                className="font-archivo mb-4 quiz-question"
                style={{
                  color: '#1A0F08',
                  fontSize: 'clamp(1.2rem, 4vw, 1.6rem)',
                  textTransform: 'uppercase',
                  lineHeight: 1.1,
                }}
              >
                {currentQ.question}
              </h3>

              <div className="flex flex-col gap-2 xl:gap-3">
                {currentQ.options.map((option, optIndex) => {
                  const isSelected = answers[currentQ.id]?.optionIndex === optIndex;
                  const isHovered = hoveredOption === `${currentQ.id}-${optIndex}`;

                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleAnswer(currentQ.id, option.points, optIndex, option.isAmerican)}
                      onMouseEnter={() => setHoveredOption(`${currentQ.id}-${optIndex}`)}
                      onMouseLeave={() => setHoveredOption(null)}
                      className="font-space text-left quiz-option"
                      style={{
                        backgroundColor: isSelected ? '#7CB3BD' : isHovered ? '#D9C4A8' : 'transparent',
                        color: '#1A0F08',
                        padding: '10px 14px',
                        fontSize: '13px',
                        fontWeight: 700,
                        border: '3px solid #2A1810',
                        borderRadius: 0,
                        cursor: 'pointer',
                        transform: isHovered && !isSelected ? 'translate(-2px, -2px)' : 'translate(0, 0)',
                        boxShadow: isHovered && !isSelected ? '2px 2px 0 #2A1810' : 'none',
                        transition: 'none',
                      }}
                    >
                      {option.text}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-4 xl:mt-6">
              {/* Back button - only show from question 2 onwards */}
              {currentQuestion > 0 ? (
                <button
                  onMouseEnter={() => setHoveredButton('back')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={goBack}
                  className="font-space quiz-nav-btn"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#1A0F08',
                    padding: '16px 28px',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    border: '3px solid #2A1810',
                    borderRadius: 0,
                    cursor: 'pointer',
                    transform: hoveredButton === 'back' ? 'translate(-3px, -3px)' : 'translate(0, 0)',
                    boxShadow: hoveredButton === 'back' ? '3px 3px 0 #2A1810' : 'none',
                    transition: 'none',
                  }}
                >
                  ← BACK
                </button>
              ) : (
                <div />
              )}

              {/* Continue / See Results button */}
              {isLastQuestion && allAnswered ? (
                <button
                  onMouseEnter={() => setHoveredButton('results')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={calculateScore}
                  className="font-space quiz-nav-btn"
                  style={{
                    backgroundColor: '#D4AF37',
                    color: '#1A0F08',
                    padding: '16px 28px',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    border: '3px solid #2A1810',
                    borderRadius: 0,
                    cursor: 'pointer',
                    transform: hoveredButton === 'results' ? 'translate(-3px, -3px)' : 'translate(0, 0)',
                    boxShadow: hoveredButton === 'results' ? '3px 3px 0 #2A1810' : 'none',
                    transition: 'none',
                  }}
                >
                  SEE RESULTS →
                </button>
              ) : (
                <button
                  onMouseEnter={() => setHoveredButton('continue')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={goNext}
                  disabled={!currentAnswered}
                  className="font-space quiz-nav-btn"
                  style={{
                    backgroundColor: currentAnswered ? '#7CB3BD' : '#CCCCCC',
                    color: currentAnswered ? '#1A0F08' : '#888888',
                    padding: '16px 28px',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    border: '3px solid',
                    borderColor: currentAnswered ? '#2A1810' : '#999999',
                    borderRadius: 0,
                    cursor: currentAnswered ? 'pointer' : 'not-allowed',
                    transform: hoveredButton === 'continue' && currentAnswered ? 'translate(-3px, -3px)' : 'translate(0, 0)',
                    boxShadow: hoveredButton === 'continue' && currentAnswered ? '3px 3px 0 #2A1810' : 'none',
                    transition: 'none',
                  }}
                >
                  CONTINUE →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESULTS SECTION */}
      {currentSection === 'results' && (
        <div
          className="min-h-screen flex flex-col items-center justify-start sm:justify-center px-6 pt-[50px] sm:pt-14 pb-3 sm:pb-6"
          style={{
            background: `linear-gradient(180deg,
              #F5EBD7 0%,
              #EDDFCB 50%,
              #D9A87E 100%
            )`,
          }}
        >
          {/* Gold accent bar */}
          <div
            className="absolute top-0 left-0 w-full"
            style={{ height: '6px', backgroundColor: '#D4AF37' }}
          />

          {/* Logo */}
          <div className="absolute top-5 left-0 w-full flex justify-center" style={{ zIndex: 20 }}>
            <Logo />
          </div>

          <div className="max-w-xl xl:max-w-[600px] 2xl:max-w-[700px] w-full" style={{ marginTop: '24px' }}>
            {/* Certificate */}
            <div
              className="cert-card"
              style={{
                backgroundColor: '#F5EBD7',
                border: '4px solid #2A1810',
                padding: '24px 20px',
                textAlign: 'center',
                maxWidth: '1000px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <p
                className="font-space cert-label"
                style={{
                  color: '#2A1810',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  marginBottom: '16px',
                }}
              >
                CERTIFICATE
              </p>

              <h2
                className="font-archivo cert-title"
                style={{
                  color: '#1A0F08',
                  fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  marginBottom: '16px',
                }}
              >
                {certificateTitle}
              </h2>

              <p
                className="font-space cert-sublabel"
                style={{
                  color: '#2A1810',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  marginBottom: '8px',
                }}
              >
                SCORE ACHIEVED
              </p>

              <p
                className="font-archivo cert-score"
                style={{
                  color: '#1A0F08',
                  fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                  lineHeight: 1,
                  marginTop: '-10px',
                  marginBottom: '20px',
                }}
              >
                {result.scoreDisplay}
              </p>

              <p className="cert-emoji" style={{ fontSize: '40px', marginTop: '-8px', marginBottom: '12px' }}>
                {result.emoji}
              </p>

              <p
                className="font-space cert-sublabel"
                style={{
                  color: '#2A1810',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  marginBottom: '8px',
                }}
              >
                RATING
              </p>

              <h3
                className="font-archivo cert-rating"
                style={{
                  color: '#1A0F08',
                  fontSize: 'clamp(1.5rem, 5vw, 3rem)',
                  textTransform: 'uppercase',
                  lineHeight: 0.95,
                  marginTop: '-8px',
                  marginBottom: '12px',
                }}
              >
                {result.title}
              </h3>

              <p
                className="font-space cert-message"
                style={{
                  color: '#2A1810',
                  fontSize: '13px',
                  fontWeight: 700,
                  marginBottom: '20px',
                }}
              >
                {result.message}
              </p>

              <div
                style={{
                  width: '100%',
                  height: '2px',
                  backgroundColor: '#2A1810',
                  margin: '0 auto 12px',
                }}
              />

              <p
                className="font-space cert-date"
                style={{
                  color: '#2A1810',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                }}
              >
                ISSUED {today} · DUBAI, UAE
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 xl:gap-3 mt-3 xl:mt-5">
              <button
                onMouseEnter={() => setHoveredButton('download')}
                onMouseLeave={() => setHoveredButton(null)}
                onClick={downloadCertificate}
                disabled={isDownloading}
                className="font-space w-full result-btn"
                style={{
                  backgroundColor: '#7CB3BD',
                  color: '#1A0F08',
                  padding: '12px 32px',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  border: '3px solid #2A1810',
                  borderRadius: 0,
                  cursor: isDownloading ? 'wait' : 'pointer',
                  transform: hoveredButton === 'download' && !isDownloading ? 'translate(-4px, -4px)' : 'translate(0, 0)',
                  boxShadow: hoveredButton === 'download' && !isDownloading ? '4px 4px 0 #2A1810' : 'none',
                  transition: 'none',
                }}
              >
                {isDownloading ? 'PREPARING...' : 'DOWNLOAD CERTIFICATE'}
              </button>

              <button
                onMouseEnter={() => setHoveredButton('share')}
                onMouseLeave={() => setHoveredButton(null)}
                onClick={shareOnX}
                className="font-space w-full result-btn"
                style={{
                  backgroundColor: '#1A0F08',
                  color: '#F5EBD7',
                  padding: '12px 32px',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  border: '3px solid #2A1810',
                  borderRadius: 0,
                  cursor: 'pointer',
                  transform: hoveredButton === 'share' ? 'translate(-4px, -4px)' : 'translate(0, 0)',
                  boxShadow: hoveredButton === 'share' ? '4px 4px 0 #2A1810' : 'none',
                  transition: 'none',
                }}
              >
                SHARE ON X
              </button>

              <button
                onMouseEnter={() => setHoveredButton('retake')}
                onMouseLeave={() => setHoveredButton(null)}
                onClick={resetQuiz}
                className="font-space w-full result-btn"
                style={{
                  backgroundColor: 'transparent',
                  color: '#1A0F08',
                  padding: '12px 32px',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  border: '3px solid #2A1810',
                  borderRadius: 0,
                  cursor: 'pointer',
                  transform: hoveredButton === 'retake' ? 'translate(-4px, -4px)' : 'translate(0, 0)',
                  boxShadow: hoveredButton === 'retake' ? '4px 4px 0 #2A1810' : 'none',
                  transition: 'none',
                }}
              >
                RETAKE TEST
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden off-screen div for certificate download — fixed 1080x1350 portrait, all absolute positioning */}
      {currentSection === 'results' && (
        <div
          ref={certificateRef}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            width: '1080px',
            height: '1350px',
            backgroundColor: '#F5EBD7',
            border: '10px solid #D4AF37',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {/* CERTIFICATE label — y=100 */}
          <p style={{
            position: 'absolute',
            top: '100px',
            left: 0,
            width: '100%',
            textAlign: 'center',
            color: '#2A1810',
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '0.25em',
            fontFamily: "'Space Mono', monospace",
            margin: 0,
          }}>
            CERTIFICATE
          </p>

          {/* Certificate title — y=165 */}
          <h2 style={{
            position: 'absolute',
            top: '165px',
            left: '40px',
            right: '40px',
            textAlign: 'center',
            color: '#1A0F08',
            fontSize: '58px',
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            fontFamily: "'Archivo Black', sans-serif",
            margin: 0,
          }}>
            {certificateTitle}
          </h2>

          {/* SCORE ACHIEVED label — y=320 */}
          <p style={{
            position: 'absolute',
            top: '320px',
            left: 0,
            width: '100%',
            textAlign: 'center',
            color: '#2A1810',
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            fontFamily: "'Space Mono', monospace",
            margin: 0,
          }}>
            SCORE ACHIEVED
          </p>

          {/* Score display — y=330 */}
          <p style={{
            position: 'absolute',
            top: '330px',
            left: 0,
            width: '100%',
            textAlign: 'center',
            color: '#1A0F08',
            fontSize: '160px',
            lineHeight: 1,
            fontFamily: "'Archivo Black', sans-serif",
            margin: 0,
          }}>
            {result.scoreDisplay}
          </p>

          {/* Emoji — y=565 */}
          <p style={{
            position: 'absolute',
            top: '565px',
            left: 0,
            width: '100%',
            textAlign: 'center',
            fontSize: '100px',
            lineHeight: 1,
            margin: 0,
          }}>
            {result.emoji}
          </p>

          {/* RATING label — y=740 */}
          <p style={{
            position: 'absolute',
            top: '740px',
            left: 0,
            width: '100%',
            textAlign: 'center',
            color: '#2A1810',
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            fontFamily: "'Space Mono', monospace",
            margin: 0,
          }}>
            RATING
          </p>

          {/* Rating title — y=775 */}
          <h3 style={{
            position: 'absolute',
            top: '775px',
            left: '50px',
            right: '50px',
            textAlign: 'center',
            color: '#1A0F08',
            fontSize: '80px',
            textTransform: 'uppercase',
            lineHeight: 0.95,
            fontFamily: "'Archivo Black', sans-serif",
            margin: 0,
          }}>
            {result.title}
          </h3>

          {/* Message — y=980 */}
          <p style={{
            position: 'absolute',
            top: '980px',
            left: '60px',
            right: '60px',
            textAlign: 'center',
            color: '#2A1810',
            fontSize: '26px',
            fontWeight: 700,
            fontFamily: "'Space Mono', monospace",
            margin: 0,
            lineHeight: 1.3,
          }}>
            {result.message}
          </p>

          {/* Divider line — y=1075 */}
          <div style={{
            position: 'absolute',
            top: '1075px',
            left: '80px',
            right: '80px',
            height: '3px',
            backgroundColor: '#2A1810',
          }} />

          {/* Issued date — y=1115 */}
          <p style={{
            position: 'absolute',
            top: '1115px',
            left: 0,
            width: '100%',
            textAlign: 'center',
            color: '#2A1810',
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            fontFamily: "'Space Mono', monospace",
            margin: 0,
          }}>
            ISSUED {today} · DUBAI, UAE
          </p>

          {/* Branding — y=1190 */}
          <p style={{
            position: 'absolute',
            top: '1190px',
            left: 0,
            width: '100%',
            textAlign: 'center',
            color: '#1A0F08',
            fontSize: '32px',
            fontFamily: "'Archivo Black', sans-serif",
            margin: 0,
          }}>
            iknowdubai.lol
          </p>
        </div>
      )}
    </>
  );
}
