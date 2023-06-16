const timeConter = document.getElementById('time-counter')
const resendBtn = document.getElementById('resend-btn')

const passowrdOne = document.getElementById('password-one')
const passwordTwo = document.getElementById('password-two')

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
    console.log('page loaded')
    if(resendBtn !== null){
        startCounter()
        resendBtn.addEventListener('click', startCounter)
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