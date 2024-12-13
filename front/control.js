const endpoint = {
    'users': "http://localhost:8080/dailyBugle/users",
    'stories': "http://localhost:8080/dailyBugle/stories",
    'newStory': "http://localhost:8080/dailyBugle/newStory",
    'adView': "http://localhost:8080/dailyBugle/adView" ,
    'adClick': "http://localhost:8080/dailyBugle/adClick" 
};

window.onload = function() {
    const userRole = sessionStorage.getItem('userRole');
    showHomePage(userRole);
};

document.getElementById('loginBtn').addEventListener('click', function() {
    const loginModal = document.getElementById('loginModal');
    loginModal.style.display = 'block';
});

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    loginUser(username, password); 
});

document.getElementById('closeModal').addEventListener('click', function() {
    const loginModal = document.getElementById('loginModal');
    loginModal.style.display = 'none';
});

document.getElementById('search').addEventListener('keydown', async function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();  

        const searchTerm = event.target.value.trim();

        if (searchTerm.length === 0) {
            fetchStories(); 
        } else {
            try {
                const response = await fetch(endpoint['stories'] + '?search=' + encodeURIComponent(searchTerm));
                if (response.ok) {
                    const stories = await response.json();
                    displayStories(stories);
                } else {
                    console.error('Search failed');
                }
            } catch (error) {
                console.error('Error during search:', error);
            }
        }
    }
});

document.getElementById('search').addEventListener('input', async function(event) {
    const searchTerm = event.target.value.trim();

    if (searchTerm.length === 0) {
        fetchStories(); 
    }
});


async function loginUser(username, password) {
    try {
        const response = await fetch(endpoint['users'], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem('userRole', data.role);

            const loginModal = document.getElementById('loginModal');
            loginModal.style.display = 'none';

            showHomePage(data.role);
        } else {
            const error = await response.json();
            document.getElementById('error').innerText = error.message || 'Login failed';
        }
    } catch (error) {
        console.error('Error during login:', error);
        document.getElementById('error').innerText = 'An error occurred. Please try again.';
    }
}

function showHomePage(userRole) {
    const homeContent = document.getElementById('homeContent');
    const advertisement = document.getElementById('advertisement');
    
    homeContent.style.display = 'block'; 
    fetchStories();
    if (userRole) {
        if (userRole === 'author') {
            const newStory = document.getElementById('newStory');
            newStory.style.display = "block";

        } else if (userRole === 'reader') {
            advertisement.innerHTML = '<img src="images/climate-change.jpg" width="300"/>';
        }
    }else{
        advertisement.innerHTML = '<img src="images/climate-change.jpg" width="300"/>';
    }
}

async function fetchStories(){
    try{
        const response = await fetch(endpoint['stories']);
        if (response.ok) {
            const stories = await response.json();
            displayStories(stories);
        } else {
            console.error('Failed to fetch stories');
        }
    } catch (error) {
        console.error('Error fetching stories:', error);
    }
}

function displayStories(stories){
    var headlineStory = document.getElementById('headlineStory');
    headlineStory.innerHTML = '';
    var storiesList = document.getElementById('storiesList');

    if (stories && stories.length > 0) {
        const recentStory = stories[0];

        if (headlineStory) {
            headlineStory.innerHTML = `
                <div class="headline-story">
                    <img src="${recentStory.image}" alt="Story image">
                    <h2>${recentStory.title}</h2>
                    <p>${recentStory.teaser}</p>
                </div>
            `;
        }

        headlineStory.addEventListener('click', function(){
            openStoryModal(recentStory._id); 
        });

        storiesList.innerHTML = '';
        stories.slice(1).forEach(story => {
            const storyItem = document.createElement('li'); 
            storyItem.classList.add('story-box'); 

            storyItem.innerHTML = `
                <div class="story-box-content">
                    <img src="${story.image}" alt="Story image">
                    <div>
                        <h2>${story.title}</h2>
                        <p>${story.teaser}</p>
                    </div>
                </div>
            `;

            storyItem.addEventListener('click', function() {
                openStoryModal(story._id); 
            });

            storiesList.appendChild(storyItem);  
        });
    } else {
        console.error('No stories available');
    }
}

async function openStoryModal(storyId) {
    try {
        console.log(endpoint['stories']+ '?story=' + storyId);
        const response = await fetch(endpoint['stories']+ '?story=' + storyId);
        if (response.ok) {
            const story = await response.json();
            displayStoryModal(story);
        } else {
            console.error('Failed to fetch the story');
        }
    } catch (error) {
        console.error('Error fetching story:', error);
    }
}

function displayStoryModal(story) {
    const userRole = sessionStorage.getItem('userRole');
    
    const storyModal = document.getElementById('storyModal');
    const storyTitle = document.getElementById('storyTitle');
    const storyImage = document.getElementById('storyImage');
    const storyBody = document.getElementById('storyBody');
    const storyCategory = document.getElementById('storyCategories');
    const storyTeaser = document.getElementById('storyTeaser');
    const commentsList = document.getElementById('commentsList');
    const addCommentSection = document.getElementById('addCommentSection');
    const submitComment = document.getElementById('submitComment');
    const editStorySection = document.getElementById('editStorySection');
    const editTitle = document.getElementById('editTitle');
    const editTeaser = document.getElementById('editTeaser');
    const editCategories = document.getElementById('editCategories');
    const editBody = document.getElementById('editBody');
    const submitEdit = document.getElementById('submitEdit');
    const ad = document.getElementById("storyAd");

    storyTitle.textContent = story.title;
    storyImage.src = story.image;
    storyBody.textContent = story.body;
    storyTeaser.textContent = story.teaser;
    storyCategory.textContent = story.category;


    commentsList.innerHTML = '';
    if (story.comments && story.comments.length > 0) {
        story.comments.forEach(comment => {
            const commentItem = document.createElement('li');
            commentItem.textContent = comment;
            commentsList.appendChild(commentItem);
        });
    }
    if(userRole !== 'author'){
        ad.innerHTML = '<img src="images/coke.jpg" width="300"/>';
        adView('coke_ad', story._id);

        ad.addEventListener('click', function() {
            adClick('coke_ad', story._id); 
        });
    }

    if (userRole === 'reader' || userRole === 'author') {
        addCommentSection.style.display = 'block';
        submitComment.onclick = function() {
            addComment(story._id, document.getElementById('newComment').value);
        };
    } else {
        addCommentSection.style.display = 'none';
    }

    if (userRole === 'author') {
        editStorySection.style.display = 'block';
        editTitle.value = story.title;
        editTeaser.value = story.teaser;
        editBody.value = story.body;
        editCategories.value = story.category.join(", ");

        submitEdit.onclick = function() {
            console.log(editCategories.value);
            editStory(story._id, editTitle.value, editTeaser.value, editBody.value, editCategories.value);
        };
    } else {
        editStorySection.style.display = 'none';
    }

    storyModal.style.display = 'block';

    document.getElementById('closeStoryModal').onclick = function() {
        storyModal.style.display = 'none';
    };
}


async function addComment(storyId, commentText) {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'reader' && userRole !== 'author') {
        alert('Please sign-in to leave a comment');
        return;
    }

    try {
        const response = await fetch(endpoint['stories'], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: storyId, comment: commentText })
        });
        console.log(response);

        if (response.ok) {
            const updatedStory = await response.json();
            displayStoryModal(updatedStory); 
        } else {
            console.error('Failed to add comment');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
    }
}

async function editStory(storyId, title, teaser, body, category) {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'author') {
        alert('You are not authorized to edit this story.');
        return;
    }

    try {
        const response = await fetch(endpoint['stories'], {  
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                _id: storyId,  
                title, 
                teaser, 
                body, 
                category
            })
        });

        if (response.ok) {
            const updatedStory = await response.json();
            displayStoryModal(updatedStory); 
        } else {
            console.error('Failed to edit story');
        }
    } catch (error) {
        console.error('Error editing story:', error);
    }
}

document.getElementById('newStory').addEventListener('click', function(){
    console.log("clicked");
    var newStorySection = document.getElementById('newStorySection');
    newStorySection.style.display = 'block'; 
    writeNewStory();
});

document.getElementById('closeNewStory').onclick = function() {
    document.getElementById('newStorySection').style.display = 'none';
};



function writeNewStory(){
    var saveNew = document.getElementById('submitStory');
    
    saveNew.onclick = function() {
        var title = document.getElementById('addTitle').value;
        var teaser = document.getElementById('addTeaser').value;
        var body = document.getElementById('addBody').value;
        var categories = document.getElementById('addCategories').value;

        console.log("creating story with:", title, teaser, body, categories);
        createStory(title, teaser, body, categories);
    }
}

async function createStory(title, teaser, body, categories){
    try {

        const categoriesArray = categories.split(',').map(cat => cat.trim());
        console.log(endpoint['newStory']);
        const response = await fetch(endpoint['newStory'], {  
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({  
                title, 
                teaser, 
                body, 
                categories: categoriesArray
            })
        });

        if (response.ok) {
            const newStory = await response.json();
            showHomePage();
        } else {
            console.error('Failed to edit story');
        }
    } catch (error) {
        console.error('Error editing story:', error);
    }

}

const ad = document.getElementById("advertisement");

function hasAdBeenViewed(adId) {
    return sessionStorage.getItem(`adViewed_${adId}`) === 'true';
}

function markAdAsViewed(adId) {
    sessionStorage.setItem(`adViewed_${adId}`, 'true');
}

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !hasAdBeenViewed(entry.target.id)) {
            markAdAsViewed(entry.target.id);  
            adView(entry.target.id);  
        }
    });
}, { threshold: 0.8 });  

observer.observe(ad);



function adView(adId, articleId = null){
    const userAgent = navigator.userAgent;
    const eventData = {
        ad_id: adId,
        date : new Date().toISOString(),
        user_agent : userAgent,
        event_type : "view",
        article_id : articleId
    };

    fetch(endpoint["adView"], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
    })
    .then(response => response.json())
    .catch(error =>{
        console.log(error);
    });
}

document.getElementById("advertisement").addEventListener('click', function(){
    adClick();
})

function adClick(adId, articleId = null){
    const userAgent = navigator.userAgent;
    const eventData = {
        ad_id: adId,
        date : new Date().toISOString(),
        user_agent : userAgent,
        event_type : "click",
        article_id : articleId
    };
    console.log(eventData);

    fetch(endpoint["adClick"], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
    })
    .then(response => response.json())
    .catch(error =>{
        console.log(error);
    });
}