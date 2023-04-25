const fs = require('fs');
const mysql = require('mysql');
const path = require('path');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'jcms',
});

connection.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных: ' + err.stack);
        return;
    }
    console.log('Подключение к базе данных успешно установлено');
});

fs.readdir('E:\\steam\\steamapps\\common\\Rust\\Bundles\\items\\', (err, files) => {
    if (err) {
        console.error('Ошибка чтения директории: ' + err);
        return;
    }
    const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');
    const promises = jsonFiles.map((file) => {
        return new Promise((resolve, reject) => {
            fs.readFile('E:\\steam\\steamapps\\common\\Rust\\Bundles\\items\\' + file, 'utf8', (err, data) => {
                if (err) {
                    console.error('Ошибка чтения файла: ' + err);
                    reject(err);
                    return;
                }

                const item = JSON.parse(data);

                const newItem = {
                    name: item.Name,
                    image: '/img/items/' + item.shortname + '.png',
                    about: item.Description,
                    price: 10,
                    command: `give ${item.shortname}`,
                };
                connection.query('INSERT INTO shops SET ?', newItem, (error, results, fields) => {
                    if (error) {
                        console.error('Ошибка добавления в базу данных: ' + error);
                        reject(error);
                        return;
                    }
                    console.log('Добавлен новый предмет в базу данных с ID: ' + results.insertId);
                    resolve(results);
                });
            });
        });
    });

    Promise.all(promises)
        .then(() => {
            connection.end((err) => {
                if (err) {
                    console.error('Ошибка закрытия подключения к базе данных: ' + err.stack);
                    return;
                }
                console.log('Подключение к базе данных успешно закрыто');
            });
        })
        .catch((err) => {
            console.error('Ошибка при добавлении предметов в базу данных: ' + err);
            connection.end((err) => {
                if (err) {
                    console.error('Ошибка закрытия подключения к базе данных: ' + err.stack);
                    return;
                }
                console.log('Подключение к базе данных успешно закрыто');
            });
        });
});
          

