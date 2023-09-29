import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import { v4 as uuid } from 'https://jspm.dev/uuid';


const appSettings = {
    databaseURL: "https://twimba-70c56-default-rtdb.asia-southeast1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const tweetsInFirebase = ref(database, "newTweetsAgain")

const bodySection = document.getElementById("body")
const newTweetText = document.getElementById("new-tweet")
// const newTweetBtn = document.getElementById("tweet-btn")
const newUserSection = document.querySelector(".create-new-user-section")
const newUserForm = document.querySelector(".create-new-user")


let tweetsData = []

let newUser = {
    handle: `@Guest User`,
    profilePic: `images/AiFace.png`,
    isVerified: false,
    likes: 0,
    retweets: 0,
    tweetText: ``,
    replies: ['0'],
    isLiked: false,
    isRetweeted: false,
    replied: false,
    uuid: uuid(),
    canDelete: true,
    retweetPost: ['0'],
    canBeRetweeted: true,
}


function createTweet(dataArray) {
    let tweetHTML = ``

    dataArray.forEach(element => {
        let verifiedClass = element[1].isVerified ? "true" : ""
        let likeClass = element[1].isLiked ? "fa-solid" : ""
        let retweetClass = element[1].isRetweeted ? "retweeted" : ""
        let deleteClass = element[1].canDelete ? "" : "none"
        let commentClass = element[1].replied ? "fa-solid" : ""
        let repliesDivClass = element[1].replied ? "show" : ""
        let repliesHTML = ``

        if (element[1].replies.length > 1) {
            element[1].replies.slice(1).forEach(reply => {
                let verifiedReplyClass = reply.isVerified ? "true" : ""

                repliesHTML += `
                <div class="reply flex">
                    <img src="${reply.profilePic}" class="user-img">
                    <h5 class="user-name flex">
                        ${reply.handle}
                        <img src="./images/Verified_Badge.svg.png" class="verified-user ${verifiedReplyClass}">
                    </h5>
                    <p class="user-tweet">
                        ${reply.tweetText}
                    </p>
                </div>
                `
            })
        }

        let retweetHTML = ``
        let tweetTextClass = element[1].tweetText ? "" : "none"

        if (element[1].retweetPost.length > 1) {

            let retweetArray = element[1].retweetPost

            retweetHTML = `
            <div class="retweet-post flex">
                <img src="${retweetArray[1]}" class="user-img">
                <h5 class="user-name flex">
                    ${retweetArray[2]}
                    <img src="./images/Verified_Badge.svg.png" class="verified-user true">
                </h5>

                <p class="user-tweet">
                    ${retweetArray[3]}
                </p>
            </div>
            `
        }

        tweetHTML += `
        <div class="tweet flex">
            <img src="${element[1].profilePic}" class="user-img">

            <button class="delete-btn flex ${deleteClass}" data-id="${element[0]}">x</button>

            <h5 class="user-name flex">
                ${element[1].handle}
                <img src="./images/Verified_Badge.svg.png" class="verified-user ${verifiedClass}">
            </h5>

            <p class="user-tweet ${tweetTextClass}">
                ${element[1].tweetText}
            </p>

            ${retweetHTML}

            <div class="icons-container flex">
                <i 
                    class="fa-regular fa-comment-dots ${commentClass}"
                    data-comment = "${element[1].uuid}"
                    >
                    <span class="comment-value">${element[1].replies.length - 1}</span>
                </i>

                <i 
                    class="fa-regular fa-heart ${likeClass}"
                    data-like = "${element[1].uuid}"
                    >
                    <span class="like-value">${element[1].likes}</span>
                </i>

                <i 
                    class="fa-solid fa-retweet ${retweetClass}"
                    data-retweet = "${element[1].uuid}"
                    >
                    <span class="retweet-value">${element[1].retweets}</span>
                </i>
            </div>

            <div class="replies flex ${repliesDivClass}">

                ${repliesHTML}

                <div class="new-reply-container flex">
                    <textarea 
                        class="new-reply" 
                        data-reply-text="${element[1].uuid}" 
                        placeholder="Reply..."></textarea>

                    <button 
                        class="reply-btn" 
                        data-reply-btn="${element[1].uuid}">
                        Reply
                    </button>
                </div>

            </div>
        </div>
        `
    });

    return tweetHTML
}

function render(dataArray) {
    bodySection.innerHTML = createTweet(dataArray)
}

newUserForm.addEventListener("submit", function (e) {
    e.preventDefault()

    let username = document.getElementById("new-user-name").value;
    let verificationStatus = document.querySelector('input[name="ver-radio"]:checked').value;
    let verified = verificationStatus === "is-verified" ? true : false
    let imagePicked = document.querySelector(`input[name="img-radio"]:checked`).value

    let userImage = 'images/male-ai.jpg'

    console.log(imagePicked)
    if (imagePicked === "homer") {
        userImage = `images/Homer-simpson.jpg`

    } else if (imagePicked === "bart") {
        userImage = 'images/Bart-simpson.jpg'

    } else if (imagePicked === "adam") {
        userImage = 'images/Adam-west.png'

    } else if (imagePicked === "peter") {
        userImage = 'images/Peter-griffon.jpg'

    } else if (imagePicked === "lois") {
        userImage = 'images/Lois-griffon.jpg'

    } else if (imagePicked === "glen") {
        userImage = 'images/Glen-quagmire.jpg'

    } else if (imagePicked === "male") {
        userImage = 'images/male-ai.jpg'

    } else if (imagePicked === "female") {
        userImage = 'images/female-ai.png'

    }

    newUser = {
        handle: `@${username}`,
        profilePic: userImage,
        isVerified: verified,
        likes: 0,
        retweets: 0,
        tweetText: ``,
        replies: ['0'],
        isLiked: false,
        isRetweeted: false,
        replied: false,
        uuid: uuid(),
        canDelete: true,
        retweetPost: ['0'],
        canBeRetweeted: true,
    };


    newUserSection.classList.add("none")

})


onValue(tweetsInFirebase, function (snapshot) {
    if (snapshot.exists()) {
        let tweetDataFromFB = Object.entries(snapshot.val())

        tweetsData = []


        tweetDataFromFB.forEach(object => {
            tweetsData.push(object)
        })

        render(tweetsData)
    }
})


document.addEventListener("dblclick", function (e) {
    if (e.target.id === "new-tweet") {
        newUserSection.classList.toggle("none")
    }

    if (e.target.dataset.id) {
        handleDeleteTweet(e.target.dataset.id)
    }

})

document.addEventListener("click", function (e) {
    if (e.target.id === "tweet-btn") {
        handleTweetBtn()
    }

    if (e.target.dataset.comment) {
        handleComment(e.target.dataset.comment)
    }

    if (e.target.dataset.like) {
        handleLike(e.target.dataset.like)
    }

    if (e.target.dataset.retweet) {
        handleRetweet(e.target.dataset.retweet)
    }

    if (e.target.dataset.replyBtn) {
        // Reply Button
        handleAddReply(e.target.dataset.replyBtn)
    }

})

function handleTweetBtn() {
    if (newTweetText.value) {
        newUser.tweetText = newTweetText.value
        newTweetText.value = ``

        tweetsData.unshift([newUser.uuid, newUser])
        // console.log(tweetsData)

        remove(tweetsInFirebase)
        tweetsData.forEach(tweet => {
            push(tweetsInFirebase, tweet[1])
        })
    } 
    // ----- Create new permenant Tweet -----
    // else {
    //     newUser = {
    //         handle: `@SenatorRodClutcher`,
    //         profilePic: `images/male-ai.jpg`,
    //         isVerified: true,
    //         likes: 582,
    //         retweets: 298,
    //         tweetText: `I feel like, we should listen to Adele ex-boyfriend's songs before we take sides`,
    //         replies: ['0'],
    //         isLiked: false,
    //         isRetweeted: false,
    //         replied: false,
    //         uuid: uuid(),
    //         canDelete: false,
    //         retweetPost: ['0'],
    //         canBeRetweeted: true,
    //     }

    //     tweetsData.push([newUser.uuid, newUser])

    //     remove(tweetsInFirebase)
    //     tweetsData.forEach(tweet => {
    //         push(tweetsInFirebase, tweet[1])
    //     })
    // }
}




function handleDeleteTweet(tweetID) {
    const tweetLocation = ref(database, `newTweetsAgain/${tweetID}`)
    remove(tweetLocation)
}




function handleComment(tweetID) {
    const targetTweet = tweetsData.filter(tweet => {
        return tweet[1].uuid === tweetID
    })[0][1]

    targetTweet.replied = !targetTweet.replied

    remove(tweetsInFirebase)
    tweetsData.forEach(data => {
        push(tweetsInFirebase, data[1])
    })
}




function handleLike(tweetID) {
    const targetTweet = tweetsData.filter(tweet => {
        return tweet[1].uuid === tweetID
    })[0][1]

    targetTweet.isLiked = !targetTweet.isLiked
    targetTweet.isLiked ? targetTweet.likes++ : targetTweet.likes--

    remove(tweetsInFirebase)
    tweetsData.forEach(data => {
        push(tweetsInFirebase, data[1])
    })
}




function handleRetweet(tweetID) {
    const targetTweet = tweetsData.filter(tweet => {
        return tweet[1].uuid === tweetID
    })[0][1]

    targetTweet.isRetweeted = !targetTweet.isRetweeted
    targetTweet.isRetweeted ? targetTweet.retweets++ : targetTweet.retweets--

    // ----- create retweeted post -----

    if (targetTweet.isRetweeted && targetTweet.canBeRetweeted) {

        let newUserRetweet = {
            handle: newUser.handle,
            profilePic: newUser.profilePic,
            isVerified: newUser.isVerified,
            likes: 0,
            retweets: 0,
            tweetText: ``,
            replies: ['0'],
            isLiked: false,
            isRetweeted: false,
            replied: false,
            uuid: uuid(),
            canDelete: true,
            retweetPost: ['0', targetTweet.profilePic, targetTweet.handle, targetTweet.tweetText],
            canBeRetweeted: false,
        }

        tweetsData.unshift([newUserRetweet.uuid, newUserRetweet])
    }

    remove(tweetsInFirebase)
    tweetsData.forEach(data => {
        push(tweetsInFirebase, data[1])
    })
}




function handleAddReply(tweetID) {
    const targetTweet = tweetsData.filter(tweet => {
        return tweet[1].uuid === tweetID
    })[0][1]

    const newReplyTextarea = document.querySelector(`textarea[data-reply-text="${tweetID}"]`)

    if (newReplyTextarea.value) {

        let newUserReply = {
            handle: newUser.handle,
            profilePic: newUser.profilePic,
            isVerified: newUser.isVerified,
            tweetText: newReplyTextarea.value,
        }

        newReplyTextarea.value = ``

        targetTweet.replies.push(newUserReply)

        remove(tweetsInFirebase)
        tweetsData.forEach(data => {
            push(tweetsInFirebase, data[1])
        })
    }
}













// const oldTweetsData = [
//     {
//         handle: `@TrollBot66756`,
//         profilePic: `images/troll.jpg`,
//         likes: 27,
//         retweets: 10,
//         tweetText: `Buy Bitcoin, ETH Make 💰💰💰 low low prices.
//             Guaranteed return on investment. HMU DMs open!!`,
//         replies: ['0'],
//         isLiked: false,
//         isRetweeted: false,
//         replied: false,
//         isVerified: false,
//         uuid: '1',
//         canDelete: false,
//         retweetPost: ['0'],
//         canBeRetweeted: true,
//     },
//     {
//         handle: `@Elon`,
//         profilePic: `images/musk.png`,
//         likes: 6500,
//         retweets: 234,
//         tweetText: `I need volunteers for a one-way mission to Mars 🪐. No experience necessary🚀`,
//         replies: ['0',
//             {
//                 handle: `@TomCruise`,
//                 isVerified: true,
//                 profilePic: `images/tcruise.png`,
//                 tweetText: `Yes! Sign me up! 😎🛩`,
//             },
//             {
//                 handle: `@ChuckNorris`,
//                 isVerified: true,
//                 profilePic: `images/chucknorris.jpeg`,
//                 tweetText: `I went last year😴`,
//             },
//         ],
//         isLiked: false,
//         isRetweeted: false,
//         replied: false,
//         isVerified: true,
//         uuid: '2',
//         canDelete: false,
//         retweetPost: ['0'],
//         canBeRetweeted: true,
//     },
//     {
//         handle: `@NoobCoder12`,
//         profilePic: `images/flower.png`,
//         likes: 10,
//         retweets: 3,
//         tweetText: `Are you a coder if you only know HTML?`,
//         replies: ['0',
//             {
//                 handle: `@StackOverflower`,
//                 isVerified: false,
//                 profilePic: `images/overflow.png`,
//                 tweetText: `No. Obviosuly not. Go get a job in McDonald's.`,
//             },
//             {
//                 handle: `@YummyCoder64`,
//                 isVerified: false,
//                 profilePic: `images/love.png`,
//                 tweetText: `You are wonderful just as you are! ❤️`,
//             },
//         ],
//         isLiked: false,
//         isRetweeted: false,
//         replied: false,
//         isVerified: false,
//         uuid: '3',
//         canDelete: false,
//         retweetPost: ['0'],
//         canBeRetweeted: true,
//     },
//     {
//         handle: `@DaniBoi`,
//         profilePic: `images/Dan-abramov.jpg`,
//         likes: 970,
//         retweets: 338,
//         tweetText: ``,
//         replies: ['0'],
//         isLiked: false,
//         isRetweeted: false,
//         replied: false,
//         isVerified: true,
//         uuid: '4',
//         canDelete: false,
//         retweetPost: ['0', 'images/musk.png', '@Elon', `I need volunteers for a one-way mission to Mars 🪐. No experience necessary🚀`],
//         canBeRetweeted: false
//     },
// ]

// oldTweetsData.forEach(tweet => {
//     push(tweetsInFirebase, tweet)
// })














