import bcrypt from 'bcryptjs';

const adminHash = '$2a$10$p4.qZ8KkW0i7E/tG4aD2E.s8lI2eZg8s3XmUq.aQeP4E67J7YtM6a';
const userHash = '$2a$10$jSdB9m7o1q9V5eS7D5a7E.W9sVjN8u6E8tP.qZ9E4wS.t8mYt2Paa';

async function check() {
  const adminMatch = await bcrypt.compare('admin123', adminHash);
  const userMatch = await bcrypt.compare('user123', userHash);
  
  console.log('Admin match:', adminMatch);
  console.log('User match:', userMatch);
}

check();
