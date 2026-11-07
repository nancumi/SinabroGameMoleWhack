import React from 'react';

/**
 * 모달창 컴포넌트 규칙 준수:
 * 1. 모달창 바깥 영역 클릭 시 창 종료
 * 2. 바깥 영역에 마우스 이동 시 커서 모양 변경하지 않음 (cursor-default)
 * 3. 모달창 내 버튼 폰트 크기: 12px (text-[12px])
 * 4. 버튼 색상: 파스텔톤 (예: pastel blue, pastel amber, pastel rose 등)
 * 5. 가장 작은 글자 11px, 기본 글자 12px
 */
export default function Modal({ isOpen, onClose, title, message, onConfirm, confirmText = '확인', cancelText }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity cursor-default"
      style={{ cursor: 'default' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[90%] max-w-sm rounded-2xl bg-[#1e222d] border border-gray-700/60 p-5 shadow-2xl text-gray-200 transform transition-all cursor-default"
        style={{ cursor: 'default' }}
      >
        {title && (
          <h3 className="text-[13px] font-bold text-gray-100 mb-2">
            {title}
          </h3>
        )}
        <div className="text-[12px] text-gray-300 leading-relaxed mb-5">
          {message}
        </div>

        <div className="flex items-center justify-end gap-2 text-[12px]">
          {cancelText && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-700 bg-[#e2e8f0] hover:bg-[#cbd5e1] transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-lg text-[12px] font-medium text-gray-800 bg-[#bfdbfe] hover:bg-[#93c5fd] active:scale-95 transition-all shadow-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

