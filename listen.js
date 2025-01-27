const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Server is running on port ${PORT}`);
  }
});
