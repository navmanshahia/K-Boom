import {cp,mkdir,rm} from 'node:fs/promises';
await rm('deploy',{recursive:true,force:true});await mkdir('deploy',{recursive:true});await cp('dist','deploy',{recursive:true});for(const file of ['api.php','setup.php','config.example.php','.htaccess'])await cp('cpanel/'+file,'deploy/'+file);console.log('cPanel package ready in deploy/');
