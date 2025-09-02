const formatTimestampToEnglishDate = (timestamp: any) => {
  const date = new Date(timestamp);

  // استخراج اليوم والشهر والسنة
  const day = date.getDate().toString().padStart(2, "0"); // اليوم (مثلاً 27)
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // الشهر (من 01 لـ 12)
  const year = date.getFullYear(); // السنة (مثلاً 2025)

  // تنسيق التاريخ يدويًا: سنة-شهر-يوم بالأرقام الإنجليزية
  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
};

export default formatTimestampToEnglishDate;
