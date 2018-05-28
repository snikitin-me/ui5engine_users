<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

$c = $app['controllers_factory'];

require_once(dirname(__DIR__) .'/models/User.php'); 

$userModel = new Users\Models\User($app);
$permModel = new Engine\Models\Permissions($config['roles']);


$c->before(function ($request, $app) use ($permModel) {
	$user = $app['session']->get('user');
	$route = $request->get('_route');
	
	if(!isset($user["user_group_name"])){
		throw new Exception("User is not authorized!");
	}

	if(!$permModel->isGranted($user["user_group_name"], $route)){
		$app['monolog']->addInfo(sprintf(
			"User [%s][%s] tried to access the resource [%s]",
			$user['username'], $user["user_group_name"], $route
		));
		throw new Exception("Resource not allowed!");
	}
});

$c->get('/profile', function () use ($app) {
	$user = $app['session']->get('user');
	return $app->json( array("d"=>array("results"=>$user)));
});

$c->get('/groups', function () use ($app, $permModel) {
	return $app->json( array("d"=>array("results"=>$permModel->getGroups())));
});

// UserSet?$skip=0&$top=20&$orderby=UserName%20asc
$c->get('/users/{id}', function ($id) use ($app, $userModel) {
	
	$user = $userModel->getUser($id);

	return $app->json( array("d"=>array("results"=>$user)));
});



$c->delete('/users/{id}', function ($id) use ($app, $userModel) {
	
	$userModel->deleteUser($id);

	return $app->json( array("d"=>array("results"=>array('user_id'=>$id))));
});



$c->get("/users", function (Request $req) use ($app, $userModel) {
	
	$users = $userModel->getUsers($req->query->all());
	return $app->json(array("d"=>array("results"=>$users)));
});



$c->post("/users", function (Request $req) use ($app, $userModel) {
	
	if(isset($_POST["user_id"])){
		$user_id = $userModel->editUser($_POST);
	}else{
		$user_id = $userModel->addUser($_POST);
	}

	$user = $userModel->getUser($user_id);

	return $app->json( array("d"=>array("results"=>$user)));
});

return $c;