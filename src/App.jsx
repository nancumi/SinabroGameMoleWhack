import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, Trophy, Timer, RotateCcw, Play } from 'lucide-react';
import MoleHole from './components/MoleHole';
import Modal from './components/Modal';
import { soundManager } from './utils/audio';

const GAME_DURATION = 30; // 30초 제한 시간
const TOTAL_HOLES = 9; // 3x3 판
const STORAGE_KEY = 'sinabro_mole_best_score';

export default function App() {
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'ended'
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // 9개 구멍 상태 관리: { up: boolean, hit: boolean }
  const [holes, setHoles] = useState(
    Array.from({ length: TOTAL_HOLES }, () => ({ up: false, hit: false }))
  );

  // 모달 상태
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '확인',
    cancelText: null,
    onConfirm: null,
  });

  const timerRef = useRef(null);
  const moleSpawnTimeoutRef = useRef(null);
  const moleDespawnTimeoutRefs = useRef([]);

  // 최고 점수 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setBestScore(parseInt(saved, 10) || 0);
      }
    } catch {
      // localStorage 불가 환경 예외 처리
    }
  }, []);

  // 두더지 전부 숨기기 정리
  const clearAllMoles = useCallback(() => {
    if (moleSpawnTimeoutRef.current) {
      clearTimeout(moleSpawnTimeoutRef.current);
    }
    moleDespawnTimeoutRefs.current.forEach((t) => clearTimeout(t));
    moleDespawnTimeoutRefs.current = [];
    setHoles(Array.from({ length: TOTAL_HOLES }, () => ({ up: false, hit: false })));
  }, []);

  // 두더지 출현 스케줄러 (캐주얼하고 쾌적한 밸런스로 난이도 조정)
  const spawnMole = useCallback(() => {
    // 현재 남은 시간에 따른 체류시간 및 쿨다운
    const currentTime = timeLeft;
    let stayDuration = 1300; // 초반 기본 체류 시간 (충분히 보고 터치할 수 있는 여유)
    let nextDelay = 380;     // 다음 출현 대기 시간
    let countToSpawn = 1;

    if (currentTime <= 10) {
      // 마지막 10초: 긴장감 있는 스퍼트 (충분히 타격 가능한 850ms)
      stayDuration = 850;
      nextDelay = 260;
      // 25% 확률로 2마리 동시 출현
      if (Math.random() < 0.25) countToSpawn = 2;
    } else if (currentTime <= 20) {
      // 중반부 20~11초
      stayDuration = 1050;
      nextDelay = 320;
    }

    setHoles((prev) => {
      // 현재 비어있는 구멍 찾기
      const emptyIndices = prev
        .map((h, i) => (!h.up ? i : null))
        .filter((i) => i !== null);

      if (emptyIndices.length === 0) return prev;

      // 무작위로 선택할 인덱스들
      const shuffled = [...emptyIndices].sort(() => 0.5 - Math.random());
      const chosen = shuffled.slice(0, Math.min(countToSpawn, emptyIndices.length));

      const nextState = [...prev];
      chosen.forEach((idx) => {
        nextState[idx] = { up: true, hit: false };

        // 일정 시간 후 자동 숨김 처리
        const despawnTimer = setTimeout(() => {
          setHoles((current) => {
            if (!current[idx]?.up) return current;
            const updated = [...current];
            updated[idx] = { up: false, hit: false };
            return updated;
          });
        }, stayDuration);

        moleDespawnTimeoutRefs.current.push(despawnTimer);
      });

      return nextState;
    });

    // 다음 두더지 출현 예약
    moleSpawnTimeoutRef.current = setTimeout(() => {
      spawnMole();
    }, stayDuration * 0.7 + nextDelay);
  }, [timeLeft]);

  // 게임 시작
  const startGame = useCallback(() => {
    clearAllMoles();
    soundManager.playStart();
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsNewRecord(false);
    setGameState('playing');
  }, [clearAllMoles]);

  // 타이머 작동
  useEffect(() => {
    if (gameState !== 'playing') return;

    // 게임 시작 시 바로 두더지 출현 시작
    spawnMole();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearAllMoles();
    };
  }, [gameState, spawnMole, clearAllMoles]);

  // 게임 종료 처리 (30초 종료)
  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0) {
      setGameState('ended');
      clearAllMoles();

      // 최고 기록 비교 및 갱신
      const previousBest = bestScore;
      if (score > previousBest) {
        setIsNewRecord(true);
        setBestScore(score);
        try {
          localStorage.setItem(STORAGE_KEY, score.toString());
        } catch {
          // ignore
        }
        soundManager.playNewRecord();

        // 화려한 컨페티 축하 효과
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      } else {
        soundManager.playGameOver();
      }
    }
  }, [gameState, timeLeft, score, bestScore, clearAllMoles]);

  // 두더지 타격
  const handleWhack = (index) => {
    if (gameState !== 'playing') return;

    setHoles((prev) => {
      if (!prev[index].up || prev[index].hit) return prev;
      const next = [...prev];
      next[index] = { ...next[index], hit: true };
      return next;
    });

    soundManager.playHit();
    setScore((s) => s + 1);

    // 맞은 두더지는 잠시 후 굴 속으로 숨김
    setTimeout(() => {
      setHoles((prev) => {
        if (!prev[index]?.hit) return prev;
        const next = [...prev];
        next[index] = { up: false, hit: false };
        return next;
      });
    }, 250);
  };

  // 음소거 토글
  const toggleSound = (e) => {
    e.stopPropagation();
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // 최고기록 리셋 (alert 대신 모달창 활용)
  const handleResetRecord = (e) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      title: '최고 기록 초기화',
      message: '현재 기기에 저장된 최고 점수 기록을 초기화하시겠습니까?',
      confirmText: '초기화',
      cancelText: '취소',
      onConfirm: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
        setBestScore(0);
      },
    });
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center p-3 sm:p-5 select-none bg-[#090b10] text-gray-200 overflow-hidden font-sans">
      {/* 배경 장식 은은한 빛 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* 중앙 집중 메인 컨테이너 */}
      <div className="relative z-10 w-full max-w-[420px] mx-auto flex flex-col items-center">
        
        {/* 상단 컨트롤러 (BEST 점수 & 음소거 버튼) - 모바일 가독성 및 터치 편의성 대폭 확대 */}
        <div className="w-full flex items-center justify-between px-1 mb-3.5">
          <div className="flex items-center gap-2 text-gray-300">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 drop-shadow-sm flex-shrink-0" />
            <span className="text-sm sm:text-base font-bold tracking-wide text-gray-100">
              BEST <span className="text-amber-400 font-mono font-black">{bestScore}</span>
            </span>
            {bestScore > 0 && gameState === 'idle' && (
              <button
                type="button"
                onClick={handleResetRecord}
                className="ml-1.5 px-2 py-0.5 rounded text-[11px] font-medium text-gray-400 hover:text-gray-200 bg-gray-800/80 hover:bg-gray-700 transition-colors"
                title="기록 초기화"
              >
                초기화
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={toggleSound}
            aria-label={isMuted ? '소리 켜기' : '소리 끄기'}
            className="p-2 sm:p-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 active:scale-95 text-gray-300 hover:text-white transition-all shadow-md flex items-center justify-center cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" />
            ) : (
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            )}
          </button>
        </div>

        {/* 핵심 콘텐츠 카드 (스코어 / 타이머 및 3x3 구멍판) */}
        <div className="w-full rounded-3xl bg-[#12151e]/90 border border-gray-800/80 p-4 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col items-center">
          
          {/* 상태 패널 (게임 중/대기 시: 타이머 & 점수 현황판 / 게임 종료 시: 다시 시작 버튼으로 대체) */}
          {gameState === 'ended' ? (
            <div className="w-full mb-4">
              <button
                type="button"
                onClick={startGame}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold text-[12px] shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>다시 시작</span>
              </button>
            </div>
          ) : (
            <div className="w-full grid grid-cols-2 gap-3 mb-4">
              {/* 남은 시간 */}
              <div className="flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl bg-[#191d29]/80 border border-gray-800/60">
                <div className="flex items-center gap-1 text-gray-400 mb-0.5">
                  <Timer className="w-3 h-3 text-cyan-400" />
                  <span className="text-[11px] font-medium tracking-wider uppercase">TIME</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span
                    className={`text-2xl font-black font-mono tracking-tight ${
                      timeLeft <= 5 && gameState === 'playing'
                        ? 'text-rose-400 animate-pulse'
                        : 'text-cyan-300'
                    }`}
                  >
                    {timeLeft}
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold">s</span>
                </div>
              </div>

              {/* 현재 점수 */}
              <div className="flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl bg-[#191d29]/80 border border-gray-800/60">
                <div className="flex items-center gap-1 text-gray-400 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[11px] font-medium tracking-wider uppercase">SCORE</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-black font-mono tracking-tight text-amber-300">
                    {score}
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold">점</span>
                </div>
              </div>
            </div>
          )}

          {/* 3x3 구멍판 메인 플레이 영역 */}
          <div className="relative w-full aspect-square max-w-[360px] p-2.5 rounded-2xl bg-[#0d0f16] border border-gray-800/70 shadow-[inset_0_4px_16px_rgba(0,0,0,0.7)] flex items-center justify-center">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-2 sm:gap-2.5">
              {holes.map((hole, idx) => (
                <MoleHole
                  key={idx}
                  isUp={hole.up}
                  isHit={hole.hit}
                  onWhack={() => handleWhack(idx)}
                />
              ))}
            </div>

            {/* 대기 화면 (시작 전: '게임 시작' 버튼) */}
            {gameState === 'idle' && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl bg-black/75 backdrop-blur-[2px] p-4 text-center">
                <div className="text-4xl mb-3 animate-bounce">🐹</div>
                <button
                  type="button"
                  onClick={startGame}
                  className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold text-[12px] shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>게임 시작</span>
                </button>
              </div>
            )}

            {/* 결과 화면 (30초 종료 후: 점수 및 최고점수 결과 표시, 화면 터치로 재시작되지 않음) */}
            {gameState === 'ended' && (
              <div
                className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl bg-black/85 backdrop-blur-sm p-4 text-center select-none cursor-default"
                style={{ cursor: 'default' }}
              >
                {/* 신기록 뱃지 */}
                {isNewRecord ? (
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold mb-3 animate-bounce">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>NEW RECORD! 신기록 달성</span>
                  </div>
                ) : (
                  <div className="text-[11px] font-medium text-gray-400 mb-2">
                    TIME OVER!
                  </div>
                )}

                {/* 최종 점수 크게 표시 */}
                <div className="flex flex-col items-center my-1">
                  <span className="text-[11px] text-gray-400 font-medium">최종 점수</span>
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-amber-400">
                    {score}
                    <span className="text-[12px] font-normal text-gray-400 ml-1">점</span>
                  </span>
                </div>

                {/* 이전 최고 점수 안내 */}
                <div className="text-[11px] text-gray-400 mt-2">
                  역대 최고 기록: <strong className="text-gray-200">{bestScore}점</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 안내 및 확인 모달 (alert 대체) */}
      <Modal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </main>
  );
}

