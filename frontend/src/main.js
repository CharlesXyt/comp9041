// importing named exports we use brackets
import { createPostTile, uploadImage,createElement} from './helpers.js';

// when importing 'default' exports, use below syntax
import API from './api.js';

const api  = new API();

// we can use this single api request multiple times
const feed = api.getFeed();

// feed
// .then(posts => {
//     posts.reduce((parent, post) => {

//         parent.appendChild(createPostTile(post));
        
//         return parent;

//     }, document.getElementById('large-feed'))
// });

// Potential example to upload an image
const input_1 = document.getElementById('post_img');
input_1.addEventListener('change',uploadImage);
const input_2 = document.getElementById('update_img');
input_2.addEventListener('change',uploadImage);

//initalize the page if user already log in, then refresh the page 
(async function inital(){
	if(find_token()){
		document.getElementById('login').style.display ='none';
		get_all();
	}
})();

//listening all of the click event
window.addEventListener('click',function(event){
	if(event.target.id =='update'){
		document.getElementById('popBox_update').style.display ='block';	
	}
	if(event.target.id =='update_close'){
		document.getElementById('popBox_update').style.display ='none';
		if(document.getElementById('img_post').hasChildNodes()){
			document.getElementById('img_post').removeChild(document.getElementById('img_post').firstChild);
		}
	}
	if(event.target.id =='update_close_1'){
		document.getElementById('popBox_update_1').style.display ='none';
		if(document.getElementById('img_update_1').hasChildNodes()){
			document.getElementById('img_update_1').removeChild(document.getElementById('img_update_1').firstChild);
		}
	}
	if(event.target.id =='close'){
		document.getElementById('popBox').style.display ='none';
	}
	if(event.target.id=='signup_button'){
		document.getElementById('popBox').style.display ='block';
		document.getElementById('sign_submit').addEventListener('click',signup);
	}
	if(event.target.id =='login_button'){
		login();
	}
	if(event.target.id =='log_out'){
		localStorage.clear()
		window.location.reload();
	}
	if(event.target.id =='my_info'){
		var temp = document.getElementById('info-content');
		temp.style.display = (temp.style.display == 'none') ? 'block' : 'none';
		document.getElementById('my_info').innerHTML = (document.getElementById('my_info').innerHTML  == 'expand_more') ? 'expand_less' : 'expand_more';
	}
	//show the users who like the post
	if(event.target.className =="button_likes"){
		const id =event.target.id.split("_")[2];
		document.getElementById(`user_likes_${id}`).style.display =(document.getElementById(`user_likes_${id}`).style.display == 'block') ? 'none' : 'block';
	}
	//show the users who make comment on the post
	if(event.target.className =="comments"){
		const id =event.target.id.split("_")[2];
		document.getElementById(`comment_display_${id}`).style.display =(document.getElementById(`comment_display_${id}`).style.display == 'block') ? 'none' : 'block';
	}
	//when the like picture clicked
	if(event.target.className=="like_it"){
		fetch(`http://localhost:5000/post/like?id=${event.target.id}`,{
		method:'PUT',
		headers:{'Authorization':'Token ' +find_token(),'Accept': 'application/json', 'Content-Type': 'application/json'}
		})
		.then(response =>response.json())
		.then(function(data){
			if(data.message !="success"){
				throw new Error(data.message);
			}
			event.target.src='/images/unthumb.jpg';
			event.target.className = "unlike_it";
			document.getElementById(`num_like_${event.target.id}`).innerHTML = `: ${parseInt(document.getElementById(`num_like_${event.target.id}`).innerHTML.split(" ")[1]) +1}`;
			document.getElementById(`user_likes_${event.target.id}`).appendChild(createElement('li',document.getElementById('user_name_log').innerHTML,{id:`user_id_like_${document.getElementById('user_id_log').innerHTML}`}));
		}).catch(function(error){
			window.alert(error);
		});
	}
	//when the unlike picture clicked
	if(event.target.className=="unlike_it"){
		fetch(`http://localhost:5000/post/unlike?id=${event.target.id}`,{
		method:'PUT',
		headers:{'Authorization':'Token ' +find_token(),'Accept': 'application/json', 'Content-Type': 'application/json'}
		})
		.then(response =>response.json())
		.then(function(data){
			if(data.message !="success"){
				throw new Error(data.message);
			}
			event.target.src='/images/thumb.jpg';
			event.target.className = "like_it";
			document.getElementById(`num_like_${event.target.id}`).innerHTML = `: ${parseInt(document.getElementById(`num_like_${event.target.id}`).innerHTML.split(" ")[1]) -1}`;
			console.log(document.getElementById(`user_likes_${event.target.id}`));
			console.log(document.getElementById(`user_id_like_${document.getElementById('user_id_log').innerHTML}`));
			document.getElementById(`user_likes_${event.target.id}`).removeChild(document.getElementById(`user_id_like_${document.getElementById('user_id_log').innerHTML}`));
		}).catch(function(error){
			window.alert(error);
		});
	}
	//when write comment button clicked
	if(event.target.className=="write_comments"){
		const id =event.target.id.split("_")[2];
		const content =document.getElementById(`comments_content_${id}`).value;
		const time = parseFloat(Date.parse(new Date()))/1000;
		fetch(`http://localhost:5000/post/comment?id=${id}`,{
			method:'PUT',
			body:JSON.stringify({
				author: document.getElementById('user_name_log').innerHTML,
				published: time,
				comment: content
			}),
			headers:{'Authorization':'Token ' +find_token(),'Accept': 'application/json', 'Content-Type': 'application/json'}
		})
		.then(response=>response.json())
		.then(function(data){
			console.log(data);
			if(data.message !="success"){
				throw new Error(data.message);
			}
			console.log(document.getElementById(`comment_display_${id}`));
			document.getElementById(`comment_display_${id}`).appendChild(createElement('li',`${document.getElementById('user_name_log').innerHTML}:${content}   at ${new Date(1000*parseFloat(time))}`,{id:`user_comment_${id}`,class: 'id-comments'}));
			document.getElementById(`number_comments_${event.target.id.split("_")[2]}`).innerHTML = `: ${parseInt(document.getElementById(`number_comments_${event.target.id.split("_")[2]}`).innerHTML.split(" ")[1]) +1}`;
			window.alert(data.message);
		})
		.catch(function(error){
			window.alert(error);
		});
		document.getElementById(`comments_content_${id}`).value="";
	}
	//when update user info button clicked
	if(event.target.id =='update_submit'){
		var user = document.getElementById('username_update').value;
		var email=document.getElementById('email_update').value;
		var password=document.getElementById('password_update').value;
		console.log("pppp");
		fetch("http://localhost:5000/user",{
			method:'PUT',
			body:JSON.stringify({
				email:email,
				name:user,
				password:password
			}),
			headers:{'Authorization':'Token ' +find_token(),'Accept': 'application/json', 'Content-Type': 'application/json'}
		}).then(response =>response.json())
		.then(function(data){
			if(data.message){
				throw new Error(data.message);
			}
			document.getElementById('popBox_update').style.display ='none';
			window.alert("Success");
			window.location.reload();
		}).catch(function(error){
			window.alert(error);
		});
	}
	//when follow button clicked
	if(event.target.id =='follow'){
		const user_follow =document.getElementById('input_follow').value;
		fetch(`http://localhost:5000/user/follow?username=${user_follow}`,{
			method:'PUT',
			headers:{'Authorization':'Token ' +find_token(),'Accept': 'application/json', 'Content-Type': 'application/json'}
		})
		.then(response =>response.json())
		.then(function(data){
			if(data.message !="success"){
				throw new Error(data.message);
			}
			window.alert("Success");
			window.location.reload();
		}).catch(function(error){
			window.alert(error);
		});
	}
	//when unfollow button clicked
	if(event.target.id =='unfollow'){
		const user_follow =document.getElementById('input_follow').value;
		fetch(`http://localhost:5000/user/unfollow?username=${user_follow}`,{
			method:'PUT',
			headers:{'Authorization':'Token ' +find_token(),'Accept': 'application/json', 'Content-Type': 'application/json'}
		})
		.then(response =>response.json())
		.then(function(data){
			if(data.message !="success"){
				throw new Error(data.message);
			}
			window.alert("Success");
			window.location.reload();
		}).catch(function(error){
			window.alert(error);
		});
	}
	//when publish button clicked
	if(event.target.id =='post_upload'){
		fetch("http://localhost:5000/post",{
			method:'POST',
			body:JSON.stringify({
				description_text:document.getElementById('post-description').value,
				src:document.getElementById('img_post').firstChild.src.split(',')[1]
			}),
			headers:{'Authorization':'Token ' +find_token(),'Accept': 'application/json', 'Content-Type': 'application/json'}
		})
		.then(response =>response.json())
		.then(function(data){
			if(data.message){
				throw new Error(data.message);
			}
			window.alert("Success");
			if(document.getElementById('img_post').hasChildNodes()){
				document.getElementById('img_post').removeChild(document.getElementById('img_post').firstChild);
			}
			document.getElementById('post-description').value="";
			window.location.reload();
		}).catch(function(error){
			window.alert(error);
		});
		
	}
	//when delete button clicked
	if(event.target.className=='btn-close delete'){
		const id = event.target.id.split("_")[1];
		fetch(`http://localhost:5000/post?id=${id}`,{
			method:'DELETE',
			headers:{'Authorization':'Token ' +find_token(),'Accept': 'application/json', 'Content-Type': 'application/json'}
		})
		.then(response =>response.json())
		.then(function(data){
			if(data.message !="success"){
				throw new Error(data.message);
			}
			window.alert("Success");
			window.location.reload();
		}).catch(function(error){
			window.alert(error);
		});
	}
	//when update button clicked
	if(event.target.className=='btn-close update'){
		document.getElementById('popBox_update_1').style.display ='block';	
		const id = event.target.id.split("_")[1];
		document.getElementById('post_update_1').addEventListener('click',function(event){
			update(event,id);
		},false);
		function update(event,id){
			var text;
			var img;
			if(document.getElementById('update-description_1').value){
				text = document.getElementById('update-description_1').value;
			}else{
				text = document.getElementById(`description_${id}`).innerHTML.split(" ")[1];
			}
			if(document.getElementById('update_img').value !=""){
				img = document.getElementById('img_update_1').firstChild.src.split(",")[1];
			}else{
				img = document.getElementById(`${id}_img`).src.split(',')[1];
			}
			console.log(img);
			fetch(`http://localhost:5000/post?id=${id}`,{
				method:'PUT',
				body:JSON.stringify({
					description_text:text,
					src:img
				}),
				headers:{'Authorization':'Token ' +find_token(),'Accept': 'application/json', 'Content-Type': 'application/json'}
				})
				.then(response =>response.json())
				.then(function(data){
					console.log(data);
				if(data.message !="success"){
					throw new Error(data.message);
				}
				document.getElementById('popBox_update_1').style.display ='none';
				if(document.getElementById('img_update_1').hasChildNodes()){
					document.getElementById('img_update_1').removeChild(document.getElementById('img_update_1').firstChild);
				}
				window.alert("Success");
				window.location.reload();
			}).catch(function(error){
				window.alert(error);
			});
		}
	}
});

//set the auth token in localStorage when user log in
function set_token(token){
	window.localStorage.setItem('AUTH_KEY', token);
}

//get the token which was stored in localStorage
function find_token(){
	return window.localStorage.getItem('AUTH_KEY');
}

//judge if an array contains a specific item
function contain(array,item){
	for(var t of array){
		if(t == item){
			return true;
		}
	}
	return false;
}

//get username and password, receive and store the auth token in localStorage
async function login(){
	const username = document.getElementById("username_l");
	const password = document.getElementById('password_l');
	const url = "http://localhost:5000/auth/login";	
	const info = await fetch(url,{
		method:'POST',
		body:JSON.stringify({
			username:`${username.value}`,
			password:`${password.value}`
		}),
		headers: { 'Accept': 'application/json', 'Content-Type': 'application/json'}
	})
	.then((response) =>response.json())
	.then(function(data){
		if(data.message){
			throw new Error(data.message);
		}
		set_token(data["token"]);
		document.getElementById('login').style.display ='none';
		get_all();
	}).catch(function(error){
		window.alert(error);
		window.location.reload();
	});
};

//set up the user info message and add list of users which are followed by the account.
function show_info(data){
	var temp = document.getElementById('info-content');
	temp.appendChild(createElement('p',data.id,{id:'user_id_log',style:'display:none;'}));
	temp.appendChild(createElement('p',data.username,{id:'user_name_log',style:'display:none;'}));
	temp.appendChild(createElement('h2',data.username,{class:'user_name'}));
	temp.appendChild(createElement('p',"Email Address: "+data.email,{class:'email'}));
	temp.appendChild(createElement('p',"Post history: "+data.posts.length),{class:'post_history'});
	temp.appendChild(createElement('p',"Followed: "+data.followed_num,{class:'followed_num'}));
	if(data.following.length > 0){
		temp.appendChild(createElement('p','Following users:',{class:'fol'}));
		var list = document.createElement('ul');
		var m =data.following.map((id) =>fetch(`http://localhost:5000/user/?id=${id}`,{
				method:'GET',
				headers:{'Authorization':'Token ' +find_token(),'Accept': 'application/json', 'Content-Type': 'application/json'}
			}).then(response =>response.json()));
		Promise.all(m).then((response) => {
				response.map(response => {
					list.appendChild(createElement('li',response.username,{class:'follow_user'}));
				});
		});
		temp.appendChild(list);
	}
	temp.appendChild(createElement('button',"Update",{class:"button button2",id:'update'}));
	document.getElementById('user_info').style.display ='block';
}

//receive argument is post id, then fetch the data of that post and display on the page
async function get_post(id){
	const url = `http://localhost:5000/post/?id=${id}`;
	await fetch(url,{
		method:'GET',
		headers:{'Authorization':'Token ' +find_token(),'Accept': 'application/json', 'Content-Type': 'application/json'}
	})
	.then(response =>response.json())
	.then(function(data){
		//console.log(data);
		const large_feed =document.getElementById('large-feed'); 
		var section = createElement('section', null, { class: 'post' });
		if(data.meta.author == document.getElementById('user_name_log').innerHTML){
			section.appendChild(createElement('button','Delete',{class:"btn-close delete" ,id:`delete_${data.id}`}));
			section.appendChild(createElement('button','Update',{class:"btn-close update",id:`update_${data.id}`}));
		}
	    section.appendChild(createElement('h2', data.meta.author, { class: 'post-title' }));
	    section.appendChild(createElement('img', null, 
	        { src: 'data:image/jpeg;base64,'+data.src, alt: data.meta.description_text,id:`${data.id}_img`, class: 'post-image' }));
	    if(contain(data.meta.likes,parseInt(document.getElementById('user_id_log').innerHTML))){
	    	section.appendChild(createElement('img',null,{src:'/images/unthumb.jpg',height:'30px',width:'30px',id:`${data.id}`,class:'unlike_it'}));
	    }else{
	    	section.appendChild(createElement('img',null,{src:'/images/thumb.jpg',height:'30px',width:'30px',id:`${data.id}`,class:'like_it'}));
	    }
	    section.appendChild(createElement('p', "published time: "+new Date(1000*parseFloat(data.meta.published)), { class: 'post-title' }));
	    section.appendChild(createElement('img',null,{src:'/images/numthumb.jpg',height:'30px',width:'30px',class:'like_img'}));
	    section.appendChild(createElement('label',": "+parseInt(data.meta.likes.length),{id:`num_like_${data.id}`,class: 'length'}));
	    section.appendChild(document.createElement('br'));
	    section.appendChild(createElement('button',"Show Likes",{id:`show_likes_${data.id}`,class:'button_likes'}));
	    section.appendChild(createElement('ul',null,{id:`user_likes_${data.id}`,style:'display:none;'}));
	    var m =data.meta.likes.map((id) =>fetch(`http://localhost:5000/user/?id=${id}`,{
			method:'GET',
			headers:{'Authorization':'Token ' +find_token(),'Accept': 'application/json', 'Content-Type': 'application/json'}
		}).then(response =>response.json()));
		Promise.all(m).then((response) => {
			response.map(response => {
				document.getElementById(`user_likes_${data.id}`).appendChild(createElement('li',response.username,{id:`user_id_like_${response.id}`}));
			});
		});
	    section.appendChild(createElement('p',"description: "+data.meta.description_text,{id:`description_${data.id}`,class: 'description'}));
	    section.appendChild(createElement('img',null,{src:'/images/comment.jpg',height:'30px',width:'30px'}));
	    section.appendChild(createElement('label',": "+parseInt(data.comments.length),{id:`number_comments_${data.id}`,class: 'number-comments'}));
	    section.appendChild(document.createElement('br'));
	    section.appendChild(createElement('button',"Show Comments",{id:`show_comments_${data.id}`,class:'comments'}));
	    section.appendChild(document.createElement('br'));
	    var a = createElement('ul',null,{id:`comment_display_${data.id}`,style:'display:none;'});
	    section.appendChild(a);
	    for(var i of data.comments){
	    	a.appendChild(createElement('li',`${i.author}:${i.comment}   at ${new Date(1000*parseFloat(i.published))}`,{id:`user_comment_${data.id}`,class: 'id-comments'}));
	    }
	    section.appendChild(createElement('textarea',null,{id:`comments_content_${data.id}`,class:'comments_content',type:"text"}));
	    section.appendChild(document.createElement('br'));
	    section.appendChild(createElement('button',"Write Comments",{id:`write_comments_${data.id}`,class:'write_comments'}));
	    large_feed.appendChild(section);
	});
}

//get the information of the sign up form, and hide the sign up popbox
async function signup(){
	const username = document.getElementById("username_s");
	const password = document.getElementById('password_s');
	const name = document.getElementById('name_s');
	const email = document.getElementById('email_s');
	const url = "http://localhost:5000/auth/signup";
	const info = await fetch(url,{
		method:'POST',
		body:JSON.stringify({
			username:`${username.value}`,
			password:`${password.value}`,
			email:`${email.value}`,
			name:`${name.value}`
		}),
		headers: { 'Accept': 'application/json', 'Content-Type': 'application/json'}
	})
	.then((response) =>response.json())
	.then(function(data){
		if(data.message){
			throw new Error(data.message);
		}
	}).catch(function(error){
		window.alert(error);
		window.location.reload();
	});
	document.getElementById('popBox').style.display ='none';
};

//require all the post which are posted by myself and following users
async function get_all(){
	var url = "http://localhost:5000/user";
	const token = find_token();
	const info = await fetch(url,{
		method:'GET',
		headers: { 'Authorization':'Token ' +token,'Accept': 'application/json', 'Content-Type': 'application/json'}
	})
	.then((response) =>response.json())
	.then(function(data){
		if(data.message){
			throw new Error(data.message);
		}
		show_info(data);
		return data;
	})
	.catch(function(error){
		window.alert(error);
		window.location.reload();
	});
	var url=`http://localhost:5000/user/feed`;
	fetch(url,{
		method:'GET',
		headers: { 'Authorization':'Token ' +find_token(),'Accept': 'application/json', 'Content-Type': 'application/json'}
	})
	.then((response) =>response.json())
	.then(function(data){
		if(data.message){
			if(data.message =='Invalid Authorization Token'){
				localStorage.clear();
			}
			throw new Error(data.message);
		}
		var t = info.posts.concat(data.posts.map(x => x.id));
		function compare(a,b){
			return parseInt(b)-parseInt(a);
		}
		for(var i of t.sort(compare)){
			get_post(i);
		}
	})
	.catch(function(error){
		window.alert(error);
		window.location.reload();
	});
}
