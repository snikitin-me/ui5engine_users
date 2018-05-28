<?php

return [
	'name' => 'Пользователи',
	'path' => __FILE__,
	'installer' => [
		'path' => __DIR__ . '/models/Installer.php',
		'class' => 'Users\Models\Installer'
	],
	'controllers' => [
		'user' => __DIR__ . '/controllers/User.php'
	]
];