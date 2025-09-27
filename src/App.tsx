import React, { useState } from 'react';
import { CheckCircle, XCircle, Award, RotateCcw, Star, Trophy, AlertCircle, Target } from 'lucide-react';

function App() {
  const [activePopup, setActivePopup] = useState<number | null>(null);

  const openPopup = (popupNumber: number) => {
    setActivePopup(popupNumber);
  };

  const closePopup = () => {
    setActivePopup(null);
  };

  // Design 1: Modern Gradient
  const PopupDesign1 = ({ isSuccess }: { isSuccess: boolean }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
        <div className={`${isSuccess ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'} p-8 text-center`}>
          <div className="w-20 h-20 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            {isSuccess ? (
              <CheckCircle className="w-12 h-12 text-white" />
            ) : (
              <XCircle className="w-12 h-12 text-white" />
            )}
          </div>
          <div className="text-6xl mb-4">
            {isSuccess ? '95%' : '45%'}
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {isSuccess ? 'تم اجتياز الاختبار بنجاح' : 'للأسف لم تتخطى هذا الامتحان بنجاح'}
          </h2>
          <p className="text-white text-opacity-90">
            {isSuccess ? 'يمكنك الذهاب الان لاستلام شهادتك' : 'حاول مرة اخرى'}
          </p>
        </div>
        <div className="p-6 space-y-3">
          <button className={`w-full py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 ${
            isSuccess 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700' 
              : 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700'
          }`}>
            {isSuccess ? 'استلام شهادة' : 'حاول مرة اخرى'}
          </button>
          <button 
            onClick={closePopup}
            className="w-full py-3 px-6 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );

  // Design 2: Minimalist Card
  const PopupDesign2 = ({ isSuccess }: { isSuccess: boolean }) => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
        <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
          isSuccess ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {isSuccess ? (
            <Award className={`w-12 h-12 text-green-600`} />
          ) : (
            <AlertCircle className={`w-12 h-12 text-red-600`} />
          )}
        </div>
        
        <div className={`text-5xl font-bold mb-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
          {isSuccess ? '95%' : '45%'}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {isSuccess ? 'تم اجتياز الاختبار بنجاح' : 'للأسف لم تتخطى هذا الامتحان بنجاح'}
        </h2>
        
        <p className="text-gray-600 mb-8 text-lg">
          {isSuccess ? 'يمكنك الذهاب الان لاستلام شهادتك' : 'حاول مرة اخرى'}
        </p>
        
        <div className="space-y-4">
          <button className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all hover:shadow-lg ${
            isSuccess 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}>
            {isSuccess ? 'استلام شهادة' : 'حاول مرة اخرى'}
          </button>
          <button 
            onClick={closePopup}
            className="w-full py-3 px-6 text-gray-500 hover:text-gray-700 transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );

  // Design 3: Animated Success/Failure
  const PopupDesign3 = ({ isSuccess }: { isSuccess: boolean }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="relative p-8 text-center">
          {/* Animated background pattern */}
          <div className={`absolute inset-0 opacity-10 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}>
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, ${isSuccess ? '#10b981' : '#ef4444'} 20%, transparent 21%), radial-gradient(circle at 80% 50%, ${isSuccess ? '#059669' : '#dc2626'} 20%, transparent 21%)`,
              backgroundSize: '30px 30px'
            }}></div>
          </div>
          
          <div className="relative z-10">
            <div className={`w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center animate-bounce ${
              isSuccess ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {isSuccess ? (
                <Trophy className="w-16 h-16 text-white" />
              ) : (
                <Target className="w-16 h-16 text-white" />
              )}
            </div>
            
            <div className={`text-6xl font-black mb-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
              {isSuccess ? '95%' : '45%'}
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-3 leading-relaxed">
              {isSuccess ? 'تم اجتياز الاختبار بنجاح' : 'للأسف لم تتخطى هذا الامتحان بنجاح'}
            </h2>
            
            <p className="text-gray-600 mb-8">
              {isSuccess ? 'يمكنك الذهاب الان لاستلام شهادتك' : 'حاول مرة اخرى'}
            </p>
            
            <div className="space-y-4">
              <button className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${
                isSuccess 
                  ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-green-200' 
                  : 'bg-red-500 text-white hover:bg-red-600 hover:shadow-red-200'
              }`}>
                <div className="flex items-center justify-center gap-3">
                  {isSuccess ? (
                    <Award className="w-6 h-6" />
                  ) : (
                    <RotateCcw className="w-6 h-6" />
                  )}
                  {isSuccess ? 'استلام شهادة' : 'حاول مرة اخرى'}
                </div>
              </button>
              <button 
                onClick={closePopup}
                className="w-full py-3 px-6 text-gray-400 hover:text-gray-600 transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Design 4: Glass Morphism
  const PopupDesign4 = ({ isSuccess }: { isSuccess: boolean }) => (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{
      background: isSuccess 
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)'
        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)'
    }}>
      <div className="relative">
        {/* Backdrop blur effect */}
        <div className="absolute inset-0 bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl"></div>
        
        <div className="relative bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-white border-opacity-30">
          <div className="flex justify-center mb-6">
            <div className={`relative w-32 h-32 rounded-full flex items-center justify-center ${
              isSuccess ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {/* Floating stars animation for success */}
              {isSuccess && (
                <>
                  <Star className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
                  <Star className="absolute -bottom-2 -left-2 w-4 h-4 text-yellow-300 animate-pulse delay-300" />
                  <Star className="absolute top-4 -left-4 w-5 h-5 text-yellow-500 animate-pulse delay-700" />
                </>
              )}
              
              {isSuccess ? (
                <Trophy className="w-20 h-20 text-white" />
              ) : (
                <XCircle className="w-20 h-20 text-white" />
              )}
              
              {/* Pulsing ring */}
              <div className={`absolute inset-0 rounded-full animate-ping ${
                isSuccess ? 'bg-green-400' : 'bg-red-400'
              } opacity-20`}></div>
            </div>
          </div>
          
          <div className={`text-7xl font-black mb-4 bg-gradient-to-r bg-clip-text text-transparent ${
            isSuccess 
              ? 'from-green-600 to-emerald-600' 
              : 'from-red-600 to-rose-600'
          }`}>
            {isSuccess ? '95%' : '45%'}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed">
            {isSuccess ? 'تم اجتياز الاختبار بنجاح' : 'للأسف لم تتخطى هذا الامتحان بنجاح'}
          </h2>
          
          <p className="text-gray-700 mb-8 text-lg">
            {isSuccess ? 'يمكنك الذهاب الان لاستلام شهادتك' : 'حاول مرة اخرى'}
          </p>
          
          <div className="space-y-4">
            <button className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl ${
              isSuccess 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-green-300' 
                : 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-red-300'
            }`}>
              <div className="flex items-center justify-center gap-3">
                {isSuccess ? (
                  <Award className="w-6 h-6" />
                ) : (
                  <RotateCcw className="w-6 h-6" />
                )}
                {isSuccess ? 'استلام شهادة' : 'حاول مرة اخرى'}
              </div>
            </button>
            <button 
              onClick={closePopup}
              className="w-full py-3 px-6 text-gray-500 hover:text-gray-700 transition-all backdrop-blur-sm bg-white bg-opacity-50 rounded-xl"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-8" dir="rtl">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          تصاميم نوافذ نتائج الامتحان
        </h1>
        
        <div className="grid grid-cols-2 gap-6 max-w-4xl">
          {/* Design 1 Buttons */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">التصميم الأول - متدرج حديث</h3>
            <button
              onClick={() => openPopup(1)}
              className="w-full py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            >
              نجاح - التصميم الأول
            </button>
            <button
              onClick={() => openPopup(2)}
              className="w-full py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              فشل - التصميم الأول
            </button>
          </div>

          {/* Design 2 Buttons */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">التصميم الثاني - بسيط أنيق</h3>
            <button
              onClick={() => openPopup(3)}
              className="w-full py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            >
              نجاح - التصميم الثاني
            </button>
            <button
              onClick={() => openPopup(4)}
              className="w-full py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              فشل - التصميم الثاني
            </button>
          </div>

          {/* Design 3 Buttons */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">التصميم الثالث - متحرك</h3>
            <button
              onClick={() => openPopup(5)}
              className="w-full py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            >
              نجاح - التصميم الثالث
            </button>
            <button
              onClick={() => openPopup(6)}
              className="w-full py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              فشل - التصميم الثالث
            </button>
          </div>

          {/* Design 4 Buttons */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">التصميم الرابع - زجاجي</h3>
            <button
              onClick={() => openPopup(7)}
              className="w-full py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            >
              نجاح - التصميم الرابع
            </button>
            <button
              onClick={() => openPopup(8)}
              className="w-full py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              فشل - التصميم الرابع
            </button>
          </div>
        </div>
      </div>

      {/* Render Popups */}
      {activePopup === 1 && <PopupDesign1 isSuccess={true} />}
      {activePopup === 2 && <PopupDesign1 isSuccess={false} />}
      
      {activePopup === 3 && <PopupDesign2 isSuccess={true} />}
      {activePopup === 4 && <PopupDesign2 isSuccess={false} />}
      
      {activePopup === 5 && <PopupDesign3 isSuccess={true} />}
      {activePopup === 6 && <PopupDesign3 isSuccess={false} />}
      
      {activePopup === 7 && <PopupDesign4 isSuccess={true} />}
      {activePopup === 8 && <PopupDesign4 isSuccess={false} />}
    </div>
  );
}

export default App;