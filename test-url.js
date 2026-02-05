const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const getFileUrl = (path) => {
  if (!path) return null;
  return `${API_BASE_URL}/${path}`;
};

console.log('Test 1:', getFileUrl('uploads/images/file-123.jpg'));
console.log('Test 2:', getFileUrl('/uploads/images/file-123.jpg'));
console.log('Test 3:', getFileUrl('uploads/images/file-1770297931974-476934395.webp'));
