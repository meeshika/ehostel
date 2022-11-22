// const btn = document.getElementById('st-btn1');

// btn.addEventListener('click', function onClick() {
//   btn.style.backgroundColor = 'rgb(117, 214, 117)';
//   btn.style.color = 'white';
//   btn.innerText='Done'
// });

function myfunction(val){
    const btn = document.getElementById('st-btn'+val);
    btn.style.backgroundColor = 'rgb(117, 214, 117)';
    btn.style.color = 'white';
    btn.innerText='Done';
}