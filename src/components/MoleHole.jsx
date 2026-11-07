import React, { useState } from 'react';

export default function MoleHole({ isUp, isHit, onWhack }) {
  const [showHammer, setShowHammer] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    if (isUp && !isHit) {
      setShowHammer(true);
      setTimeout(() => setShowHammer(false), 220);
      onWhack();
    }
  };

  return (
    <div
      onClick={handleClick}
      className="relative aspect-square w-full max-w-[110px] sm:max-w-[124px] mx-auto rounded-3xl bg-gradient-to-b from-[#161a23] to-[#0c0e14] border border-[#232936] shadow-inner flex items-center justify-center overflow-hidden cursor-pointer select-none group touch-manipulation"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* 굴 내부 그림자 효과 */}
      <div className="absolute inset-x-3 bottom-2 h-7 rounded-full bg-[#07080b]/90 blur-[1px] shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)] border-b border-gray-800/40" />

      {/* 두더지 캐릭터 */}
      <div
        className={`absolute bottom-2.5 flex flex-col items-center transition-all duration-150 ease-out pointer-events-auto ${
          isUp
            ? isHit
              ? 'translate-y-2 scale-90 opacity-90'
              : 'translate-y-0 scale-100 opacity-100 animate-pop-up'
            : 'translate-y-24 scale-75 opacity-0 pointer-events-none'
        }`}
      >
        {/* 두더지 SVG 그래픽 */}
        <div className="relative w-16 h-20 sm:w-[72px] sm:h-[88px] flex items-center justify-center">
          <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md">
            {/* 귀 */}
            <circle cx="28" cy="35" r="12" fill="#78350f" />
            <circle cx="28" cy="35" r="7" fill="#fbcfe8" />
            <circle cx="72" cy="35" r="12" fill="#78350f" />
            <circle cx="72" cy="35" r="7" fill="#fbcfe8" />

            {/* 몸통 / 얼굴 */}
            <path
              d="M20 120 C20 50, 80 50, 80 120 Z"
              fill="#92400e"
            />
            {/* 배/가슴 밝은 영역 */}
            <path
              d="M32 120 C32 80, 68 80, 68 120 Z"
              fill="#d97706"
              opacity="0.8"
            />

            {/* 머리 위 작은 털 */}
            <path
              d="M48 24 Q50 14 55 18 Q50 18 50 24"
              stroke="#78350f"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            {/* 주둥이 */}
            <ellipse cx="50" cy="62" rx="20" ry="14" fill="#fef3c7" />

            {/* 코 */}
            <ellipse cx="50" cy="56" rx="8" ry="6" fill="#f43f5e" />
            <circle cx="48" cy="54" r="2" fill="#ffffff" opacity="0.8" />

            {/* 수염 */}
            <line x1="28" y1="62" x2="16" y2="60" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="66" x2="18" y2="70" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            <line x1="72" y1="62" x2="84" y2="60" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            <line x1="72" y1="66" x2="82" y2="70" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />

            {/* 눈 상태: 타격 시 빙글빙글(X 또는 어지러움) vs 평소 초롱초롱 */}
            {isHit ? (
              <g stroke="#1f2937" strokeWidth="3" strokeLinecap="round">
                {/* 왼쪽 X 눈 */}
                <line x1="32" y1="42" x2="42" y2="50" />
                <line x1="42" y1="42" x2="32" y2="50" />
                {/* 오른쪽 X 눈 */}
                <line x1="58" y1="42" x2="68" y2="50" />
                <line x1="68" y1="42" x2="58" y2="50" />
                {/* 어지러운 입 */}
                <path d="M44 71 Q50 67 56 71" stroke="#b91c1c" strokeWidth="2" fill="none" />
              </g>
            ) : (
              <g>
                {/* 왼쪽 눈 */}
                <circle cx="37" cy="46" r="5" fill="#111827" />
                <circle cx="35" cy="44" r="2" fill="#ffffff" />
                {/* 오른쪽 눈 */}
                <circle cx="63" cy="46" r="5" fill="#111827" />
                <circle cx="61" cy="44" r="2" fill="#ffffff" />
                {/* 미소 입 */}
                <path d="M45 68 Q50 73 55 68" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                {/* 볼터치 */}
                <circle cx="28" cy="56" r="4" fill="#fda4af" opacity="0.6" />
                <circle cx="72" cy="56" r="4" fill="#fda4af" opacity="0.6" />
              </g>
            )}

            {/* 앞발 */}
            <ellipse cx="26" cy="95" rx="8" ry="6" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
            <ellipse cx="74" cy="95" rx="8" ry="6" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
          </svg>

          {/* 타격 시 별똥별 이펙트 */}
          {isHit && (
            <div className="absolute -top-3 inset-x-0 flex justify-center items-center gap-1 animate-bounce pointer-events-none">
              <span className="text-yellow-300 text-sm">⭐</span>
              <span className="text-amber-200 text-xs">✨</span>
              <span className="text-yellow-300 text-sm">⭐</span>
            </div>
          )}
        </div>
      </div>

      {/* 타격 시 뿅망치 타격 애니메이션 */}
      {showHammer && (
        <div className="absolute top-1 right-2 pointer-events-none transform -rotate-45 scale-125 transition-transform duration-100 z-20">
          <span className="text-3xl filter drop-shadow-lg">🔨</span>
        </div>
      )}

      {/* 타격 시 +1 플로팅 텍스트 */}
      {isHit && (
        <div className="absolute top-2 inset-x-0 flex justify-center pointer-events-none z-30 animate-float-score">
          <span className="font-extrabold text-[15px] text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            +1
          </span>
        </div>
      )}

      {/* 구멍 앞 가림막 (두더지가 구멍 아래에서 올라오는 입체감 연출) */}
      <div className="absolute inset-x-2 bottom-1 h-4 rounded-b-2xl bg-gradient-to-t from-[#11141c] to-transparent pointer-events-none" />
    </div>
  );
}

