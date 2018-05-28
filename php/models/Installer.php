<?php
namespace Users\Models;

require_once(dirname(__DIR__) .'/models/User.php'); 

use Engine\Library\Model;

class Installer extends Model {

	protected $_userModel;

	public function __construct($registry) {
		parent::__construct($registry);

		$this->_userModel = new User($registry);		
	}

	public function getForm() {
		// TODO форма для установки начальных параметров
	}

	public function install() {

		$this->createTables();

		// TODO move to form
		$this->_userModel->addUser([
			'user_id'=> 1,
			'user_group_name'=> 'administrator',
			'region_id'=> 0,
			'username'=> 'admin',
			'password'=> 'test',
			'salt'=> 'a4RTNNUwo',
			'firstname'=> 'John',
			'lastname'=> 'Doe', 
			'email'=> 'snikitin.me@gmail.com',
			'image'=> '',
			'code'=> '',
			'ip'=> '',
			'status'=> 1
		]);

		return true;
	}

	public function delete(){

		$this->deleteTables();

	}

	public function createTables(){
				$sql = <<<EOF

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- --------------------------------------------------------

--
-- Структура таблицы `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  -- `user_group_id` int(11) NOT NULL, TODO
  `user_group_name` varchar(64) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `salt` varchar(9) NOT NULL,
  `firstname` varchar(32) NOT NULL,
  `lastname` varchar(32) NOT NULL,
  `email` varchar(96) NOT NULL,
  `image` varchar(255) NOT NULL,
  `code` varchar(40) NOT NULL,
  `ip` varchar(40) NOT NULL,
  `status` tinyint(1) NOT NULL,
  `date_added` datetime NOT NULL,
  
  -- extends fields --
  `region_id` int(11) NOT NULL,

  PRIMARY KEY (user_id)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

EOF;

		$this->db->query($sql); 
	}

	public function deleteTables(){
		$sql = <<<EOF

DROP TABLE IF EXISTS `user`;

EOF;

		$this->db->query($sql); 
	}
}
