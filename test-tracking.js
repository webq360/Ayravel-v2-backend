// Test tracking number generation
const generateTrackingNumber = () => {
  return Math.floor(Math.random() * 900000000) + 100000000;
};


for (let i = 0; i < 10; i++) {
  const num = generateTrackingNumber();
  
}
