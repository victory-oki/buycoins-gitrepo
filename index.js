var model = (function(){
    const fetchRepoQuery = `
    {
        user(login:"ireade") {
          login
          bio
          avatarUrl
          name
          repositories(first: 15, orderBy: {field: UPDATED_AT, direction: DESC}) {
            nodes {
              name
              description
              forkCount
              stargazerCount
              nameWithOwner
              updatedAt
              collaborators {
                totalCount
              }
              primaryLanguage {
                color
                name
              }
            }
          }
        }
      }    
    `
    var user = {
        data:{}
    }
    var setUser = function(data){
        user.data = {...data}
    }
    return {
        fetchRepoQuery,
        setUser,
        getUser: function(){return user}
    }
})()

var view = (function(){
    var domStrings = {
        burger: '#burger',
        nav: '#nav-sm',
        repository: '#repositoryContainer',
        profileSmallContainer: '#profile-sm',
        profileLargeContainer: '#profile-lg',
        navImg: '#nav-img',
        repoCount: '.repoCount',
        loader: '#loader',
        loader: '#loader',
        mainContent: '#mainContent',
    }

    var toggleNav = function (){
        document.querySelector(domStrings.burger).classList.toggle('open')
        document.querySelector(domStrings.nav).classList.toggle('open')
    }

    var formatTime = function (time){
        var month = {1:'Jan', 2:'Feb', 3:'Mar', 4:'Apr', 5:'May', 6:'Jun', 7:'Jul', 8:'Aug', 9:'Sep', 10:'Oct', 11:'Nov', 12:'Dec'}
        var date = time.split("T")[0]
        date = date.split('-')
        return `${month[date[1]]} ${date[2]}`
    }
    var setProfileLgTemplate =  function (data){
        var template = `
            <div class="profile__img-container">
                    <img
                    src="${data.avatarUrl}"
                    alt="profile image"
                    class="profile__img"
                    />
            </div>
            <h4 class="profile__name">${data.name}</h4>
            <h5 class="profile__user-name">${data.login}</h5>
            <p class="profile__desc">
                ${data.bio}
            </p>
        `
        return template
    }
    var setProfileSmTemplate =  function (data){
        var template = `
        <div class="profile__header">
            <div class="profile__img-container">
            <img
                src="${data.avatarUrl}"
                alt="profile image"
                class="profile__img"
            />
            </div>
            <div class="profile__names">
            <h4 class="profile__name">${data.name}</h4>
            <h5 class="profile__user-name">${data.login}</h5>
            </div>
        </div>
        <p class="profile__desc">
            ${data.bio}
        </p>
        `
        return template
    }

    var populateProfileContainer =function ({data}){
        var largeContainer = document.querySelector(domStrings.profileLargeContainer);
        var smallContainer = document.querySelector(domStrings.profileSmallContainer);
        largeContainer.innerHTML = '';
        smallContainer.innerHTML = '';
        var lgTemplate = setProfileLgTemplate(data);
        var smTemplate = setProfileSmTemplate(data);
        largeContainer.innerHTML = lgTemplate
        smallContainer.innerHTML = smTemplate;
    }

    var populateNavImg = function ({data:{avatarUrl}}){
        document.querySelector(domStrings.navImg).setAttribute('src', avatarUrl)
    }

    var populateCount = function ({data:{repositories}}){
        var nl = document.querySelectorAll(domStrings.repoCount);
        for (var i=0; i < nl.length; i++) {
            nl[i].textContent = repositories.nodes.length;
        }
    }

    var setRepositoryItem = function(repo){
        let template = `
            <div class="repository">
            <div class="repository__desc">
            <h5 class="repository__title">${repo.name}</h5>
            <p class="repository__brief">${repo.description}</p>
            <div class="repository__stats">
                <div class="repository__stack">
                <div class="repository__stack--icon" style='background-color:${repo.primaryLanguage?.color};'></div>
                <div class="repository__stack--title">${repo.primaryLanguage?.name}</div>
                </div>
                <div class="repository__star">
                <img
                    src="./assets/svg/star-icon.svg"
                    class="repository__star--icon"
                    alt="star icon"
                />
                <span class="repository__star--count">${repo.stargazerCount}</span>
                </div>
                <div class="repository__fork">
                <img
                    src="./assets/svg/fork-icon.svg"
                    alt="fork icon"
                    class="repository__fork--icon"
                />
                <span class="repository__fork--count">${repo.forkCount}</span>
                </div>
                <div class="repository__time-stamp">Updated on ${formatTime(repo.updatedAt)}</div>
            </div>
            </div>
            <button class="repository__star-action">
            <img src="./assets/svg/star-icon.svg" alt="star icon" />
            <span>Star</span>
            </button>
        </div>
        `
        return template
    }
    var showContent = function(){
        document.querySelector(domStrings.loader).classList.toggle('hidden')
        document.querySelector(domStrings.mainContent).classList.toggle('hidden')
    }
    var populateRepository = function ({data:{repositories:{nodes}}}){
        var repoContainer = document.querySelector(domStrings.repository)
        repoContainer.innerHTML = ''
        nodes.forEach((repo)=>{
            repoTemplate = setRepositoryItem(repo)
            repoContainer.insertAdjacentHTML('beforeend', repoTemplate)
        })  
    }

    return{
        getDom: function (){ return domStrings},
        toggleNav,
        populateRepository,
        populateProfileContainer,
        populateNavImg,
        populateCount,
        showContent
    }
})()

var controller = (function(model, view){
    var setupEventListeners = function () {
        var dom = view.getDom();
        document.querySelector(dom.burger).addEventListener('click', view.toggleNav);
    }

    var fetchRepositoryData = function(){
        fetch('https://api.github.com/graphql',{
            method:'POST',
            headers: { "Content-Type": "application/json", "Authorization": "Bearer 5e25049a85ef5aa5ee382e8146e88424d3b0eecf"},
            body: JSON.stringify({
                query: model.fetchRepoQuery
            })
        })
        .then(
            res=>{
                if(res.status === 401){
                    throw res.statusText
                }
                return res.json()
            }
        )
        .then(data=>{
            console.log(data)
            model.setUser(data.data.user)
            view.showContent()
            view.populateRepository(model.getUser())
            view.populateProfileContainer(model.getUser())
            view.populateNavImg(model.getUser())
            view.populateCount(model.getUser())
        })
        .catch((error)=>{
            console.log(error)
            alert(error)
        })
    }

    return {
        init: function () {
            console.log("application has started");
            setupEventListeners();
            fetchRepositoryData();
        },
        
    }
})(model, view)

controller.init();


