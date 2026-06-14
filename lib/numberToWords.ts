/**
 * Indian Rupees amount-to-words. Lifted verbatim from the invoice preview to
 * keep output identical across document types (handles up to thousands).
 */
export function numberToWords(amount: number): string {
  const singleDigits = [
    "", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
  ];
  const twoDigits = [
    "", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY",
  ];
  const teens = [
    "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN",
    "SEVENTEEN", "EIGHTEEN", "NINETEEN",
  ];

  function convertToWords(num: number): string {
    let words = "";
    if (num >= 1000) {
      const thousands = Math.floor(num / 1000);
      words += `${convertToWords(thousands)} THOUSAND `;
      num %= 1000;
    }
    if (num >= 100) {
      const hundreds = Math.floor(num / 100);
      words += `${singleDigits[hundreds]} HUNDRED `;
      num %= 100;
    }
    if (num > 10 && num < 20) {
      words += `${teens[num - 11]} `;
    } else if (num >= 20 || num === 10) {
      const tens = Math.floor(num / 10);
      words += `${twoDigits[tens]} `;
      num %= 10;
    }
    if (num > 0 && num <= 9) {
      words += `${singleDigits[num]} `;
    }
    return words.trim();
  }

  const integerPart = Math.floor(amount);
  const words = convertToWords(integerPart).trim();
  return words ? `${words} RUPEES ONLY` : "ZERO RUPEES ONLY";
}
