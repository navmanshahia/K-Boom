<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function respond($data, int $status=200): never {http_response_code($status);echo json_encode($data, JSON_UNESCAPED_UNICODE);exit;}
$private=__DIR__.'/.private';
if(!is_dir($private)&&!mkdir($private,0700,true))respond(['error'=>'Storage unavailable. Check directory permissions.'],503);
if(!file_exists($private.'/.htaccess'))file_put_contents($private.'/.htaccess',"Require all denied\nDeny from all\n");
function readRecord(string $key) {global $private;$path=$private.'/'.hash('sha256',$key).'.json';if(!file_exists($path))return null;$f=fopen($path,'r');if(!$f)throw new RuntimeException('Read failed');flock($f,LOCK_SH);$s=stream_get_contents($f);flock($f,LOCK_UN);fclose($f);return json_decode($s,true,512,JSON_THROW_ON_ERROR);}
function writeRecord(string $key,array $value):void {global $private;$f=fopen($private.'/'.hash('sha256',$key).'.json','c+');if(!$f)throw new RuntimeException('Write failed');flock($f,LOCK_EX);ftruncate($f,0);fwrite($f,json_encode($value,JSON_THROW_ON_ERROR));fflush($f);flock($f,LOCK_UN);fclose($f);}
$https=(!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off');
$base=rtrim(str_replace('\\','/',dirname($_SERVER['SCRIPT_NAME'])),'/');
session_name('kboom_owner');session_set_cookie_params(['lifetime'=>0,'path'=>($base?:'').'/','secure'=>$https,'httponly'=>true,'samesite'=>'Strict']);session_start();
$auth=isset($_SESSION['owner_until'])&&$_SESSION['owner_until']>time();
$method=$_SERVER['REQUEST_METHOD'];$path=trim($_GET['route']??'','/');
$defaults=['headline'=>'The art of arriving home.','intro'=>'Thoughtful cleaning and beautifully prepared spaces. For the homes you treasure, and the guests you welcome.','phone'=>'022 348 9772','email'=>'kboomkleen@gmail.com'];
try{
if(!in_array($method,['GET','HEAD'],true)){
 if(isset($_SERVER['HTTP_ORIGIN'])){$expected=($https?'https':'http').'://'.$_SERVER['HTTP_HOST'];if($_SERVER['HTTP_ORIGIN']!==$expected)respond(['error'=>'Origin rejected.'],403);}
 if(!str_contains($_SERVER['CONTENT_TYPE']??'','application/json'))respond(['error'=>'JSON required.'],415);
 $raw=file_get_contents('php://input',false,null,0,16001);if(strlen($raw)>16000)respond(['error'=>'Request too large.'],413);$body=json_decode($raw,true);if(!is_array($body))respond(['error'=>'Invalid request.'],400);
}
if($path==='config'&&$method==='GET')respond(readRecord('config')??$defaults);
if($path==='session'&&$method==='GET')respond(['authenticated'=>$auth]);
if($path==='login'&&$method==='POST'){
 $credentials=readRecord('credentials');if(!$credentials)respond(['error'=>'Owner access needs setup. Open setup.php after configuring your installation key.'],503);
 $key='attempt/'.($_SERVER['REMOTE_ADDR']??'unknown');$rate=readRecord($key)??['count'=>0,'until'=>0];if($rate['until']>time()&&$rate['count']>=8)respond(['error'=>'Too many attempts. Try again in 15 minutes.'],429);
 if(!password_verify((string)($body['password']??''),$credentials['hash'])){writeRecord($key,['count'=>$rate['until']>time()?$rate['count']+1:1,'until'=>time()+900]);respond(['error'=>'Incorrect password.'],401);}
 writeRecord($key,['count'=>0,'until'=>0]);session_regenerate_id(true);$_SESSION['owner_until']=time()+28800;respond(['ok'=>true]);
}
if($path==='logout'&&$method==='POST'){$_SESSION=[];session_destroy();setcookie(session_name(),'', ['expires'=>time()-3600,'path'=>($base?:'').'/','secure'=>$https,'httponly'=>true,'samesite'=>'Strict']);respond(['ok'=>true]);}
if($path==='enquiries'&&$method==='POST'){
 if(!empty($body['website']))respond(['error'=>'Unable to accept request.'],400);
 $data=[];foreach(['name','email','phone','area','service','bedrooms','date','notes'] as $k){if(isset($body[$k])&&!is_scalar($body[$k]))respond(['error'=>'Invalid field.'],400);$data[$k]=substr(trim((string)($body[$k]??'')),0,$k==='notes'?3000:200);}
 if(!$data['name']||!filter_var($data['email'],FILTER_VALIDATE_EMAIL)||!in_array($data['area'],['Wānaka','Albert Town','Lake Hāwea','Luggate','Other'],true)||!in_array($data['service'],['Short-stay turnovers','Deep cleaning','Linen preparation','Tailored property care'],true)||($body['consent']??false)!==true)respond(['error'=>'Complete the required fields and consent.'],400);
 $today=(new DateTimeImmutable('now',new DateTimeZone('Pacific/Auckland')))->format('Y-m-d');if($data['date']&&(!preg_match('/^\d{4}-\d{2}-\d{2}$/',$data['date'])||$data['date']<$today))respond(['error'=>'Choose a future date.'],400);
 $key='submit/'.($_SERVER['REMOTE_ADDR']??'unknown');$rate=readRecord($key)??['count'=>0,'until'=>0];if($rate['until']>time()&&$rate['count']>=10)respond(['error'=>'Too many requests. Please contact us directly.'],429);writeRecord($key,['count'=>$rate['until']>time()?$rate['count']+1:1,'until'=>time()+3600]);
 $id=bin2hex(random_bytes(12));$data+=['id'=>$id,'status'=>'New','createdAt'=>gmdate('c'),'internalNotes'=>''];writeRecord('enquiry/'.$id,$data);respond(['ok'=>true,'id'=>$id],201);
}
if(!$auth)respond(['error'=>'Please sign in.'],401);
if($path==='enquiries'&&$method==='GET'){$records=[];foreach(glob($private.'/*.json') as $file){$f=fopen($file,'r');flock($f,LOCK_SH);$data=json_decode(stream_get_contents($f),true);flock($f,LOCK_UN);fclose($f);if(isset($data['id'],$data['createdAt'],$data['service']))$records[]=$data;}usort($records,fn($a,$b)=>strcmp($b['createdAt'],$a['createdAt']));respond($records);}
if(preg_match('#^enquiries/([a-f0-9]{24})$#',$path,$m)&&$method==='PATCH'){$data=readRecord('enquiry/'.$m[1]);if(!$data)respond(['error'=>'Not found.'],404);if(!in_array($body['status']??'',['New','Contacted','Consultation','Booked','Completed','Declined'],true))respond(['error'=>'Invalid status.'],400);$data['status']=$body['status'];$data['internalNotes']=substr((string)($body['internalNotes']??''),0,5000);writeRecord('enquiry/'.$m[1],$data);respond($data);}
if($path==='config'&&$method==='PUT'){$data=[];foreach($defaults as $k=>$v){$data[$k]=substr(trim((string)($body[$k]??'')),0,500);if(!$data[$k])respond(['error'=>'All fields are required.'],400);}if(!filter_var($data['email'],FILTER_VALIDATE_EMAIL))respond(['error'=>'Enter a valid email.'],400);writeRecord('config',$data);respond($data);}
respond(['error'=>'Not found.'],404);
}catch(Throwable $e){error_log('K-Boom API: '.$e->getMessage());respond(['error'=>'Service temporarily unavailable. Please contact us directly.'],503);}
