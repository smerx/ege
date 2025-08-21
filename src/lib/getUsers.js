const connection = require("./db");

// Функция для получения всех пользователей
const getUsers = () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users"; // SQL-запрос для получения всех пользователей

    connection.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results); // Возвращаем результаты запроса
      }
    });
  });
};

// Пример использования
getUsers()
  .then((users) => {
    console.log("Пользователи:", users);
  })
  .catch((err) => {
    console.error("Ошибка при получении пользователей:", err);
  });
