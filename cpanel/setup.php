<?php
declare(strict_types=1);
header('Cache-Control: no-store');header('X-Frame-Options: DENY');
$private=__DIR__.'/.private';$credentialFile=$private.'/'.hash('sha256','credentials').'.json';
if(file_exists($credentialFile)){http_response_code(403);exit('Setup is complete and locked. Open admin to sign in.');}
$config=file_exists(__DIR__.'/config.php')?require __DIR__.'/config.php':[];
$message='';$success=false;
if($_SERVER['REQUEST_METHOD']==='POST'){
 $key=(string)($config['setup_key']??'');$password=(string)($_POST['password']??'');
 if(strlen($key)<24||$key==='CHANGE_THIS_TO_A_RANDOM_PRIVATE_KEY'){$message='First configure a private installation key in config.php using cPanel File Manager.';}
 elseif(!hash_equals($key,(string)($_POST['key']??''))){sleep(1);$message='Incorrect installation key.';}
 elseif(strlen($password)<14){$message='Use an owner password of at least 14 characters.';}
 else{
 if(!is_dir($private))mkdir($private,0700,true);file_put_contents($private.'/.htaccess',"Require all denied\nDeny from all\n");
 $f=@fopen($credentialFile,'x');if(!$f){$message='Setup was already completed or storage is unavailable.';}else{fwrite($f,json_encode(['hash'=>password_hash($password,PASSWORD_DEFAULT)]));fclose($f);chmod($credentialFile,0600);$success=true;$message='Owner account created. Setup is now locked.';}
 }
}
?><!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>K-Boom owner setup</title><style>body{background:#f6f3ec;color:#273c34;font:15px/1.7 system-ui;max-width:520px;margin:70px auto;padding:25px}h1{font:48px Georgia}label{display:block;margin:22px 0}input{display:block;width:100%;padding:13px;box-sizing:border-box;border:1px solid #adb6a6}button{background:#273c34;color:white;border:0;padding:15px 25px}a{color:inherit}</style><h1>K-Boom owner setup.</h1><p>One-time setup for your private owner dashboard.</p><p><?=htmlspecialchars($message,ENT_QUOTES,'UTF-8')?></p><?php if(!$success):?><p>In cPanel File Manager, copy <b>config.example.php</b> to <b>config.php</b>. Replace its setup key with your own random private string of at least 24 characters. Enter that key here to create your owner password.</p><form method="post"><label>Installation key<input name="key" type="password" required autocomplete="off"></label><label>New owner password<input name="password" type="password" minlength="14" required autocomplete="new-password"></label><button>Create owner account</button></form><?php else:?><a href="admin">Open owner dashboard →</a><?php endif;?></html>
