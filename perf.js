const fstr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.repeat(1000*10000)


const isLtr = (char) => char.toUpperCase() != char.toLowerCase();
const isNum = (char) => !isNaN(parseInt (char, 10));

const start1 = Date.now();
let letters = 0;
for (let k = 0; k < fstr.length; k++) {
  const char = fstr.charAt(k);
  if (isLtr (char)) {
    letters++;
  }
}
const end1 = Date.now();

console.log ('isLtr', end1 - start1, `letters: ${letters}`)



const start2 = Date.now();
letters = 0;
for (let k = 0; k < fstr.length; k++) {
  const char = fstr.charAt(k);
  if (!isNum (char)) {
    letters++;
  }
}
const end2 = Date.now();

console.log ('isNum', end2 - start2, `letters: ${letters}`)
