const timeConter = document.getElementById('time-counter')
const resendBtn = document.getElementById('resend-btn')

const passowrdOne = document.getElementById('password-one')
const passwordTwo = document.getElementById('password-two')
const createAccountBtn = document.getElementById('create_acct_btn')

if(passowrdOne !== null && passwordTwo !== null){
    const passwordWarning = document.getElementById('front-warning')
    passowrdOne.addEventListener('input', function(e){
       
        if(checkEquality(passwordTwo.value, passowrdOne.value)){
            passowrdOne.classList.remove('wrong-password')
            passwordTwo.classList.remove('wrong-password')
            passwordWarning.style.display = 'none'
        }
        else{
            passowrdOne.classList.add('wrong-password')
            passwordTwo.classList.add('wrong-password')
            passwordWarning.style.display = 'block'
        }
    })

    passwordTwo.addEventListener('input', function(e){
        if(checkEquality(passwordTwo.value, passowrdOne.value)){
            passowrdOne.classList.remove('wrong-password')
            passwordTwo.classList.remove('wrong-password')
            passwordWarning.style.display = 'none'
        }
        else{
            passowrdOne.classList.add('wrong-password')
            passwordTwo.classList.add('wrong-password')
            passwordWarning.style.display = 'block'
        }
    })
}


function checkEquality(paramOne, paramTwo){
    if(paramOne == paramTwo){
        return true
    }
    else{
        return false
    }
}


window.addEventListener('DOMContentLoaded', (event)=>{
    console.log('Welcome to datagridder, what are you doing back here by the way?')
    if(resendBtn !== null){
        startCounter()
        resendBtn.addEventListener('click', startCounter)
        resendBtn.addEventListener('click', function(){
            let linkTag = document.getElementById('download-link-tag')
            linkTag.click()
        })
    }


  
})

function startCounter(){
    
    resendBtn.disabled = true
   
    let seconds = 30
    let minutes = 1

    function updateTimer(){
        if(seconds ==0 && minutes ==0){
            timeConter.textContent = `${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`
            resendBtn.disabled = false
            return
        }

        timeConter.textContent = `${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`
        seconds--

        if(seconds <0 ){
            minutes --
            seconds = 59
        }

        setTimeout(updateTimer, 1000)
    }


    updateTimer()
}