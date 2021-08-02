let canvas_f2 = document.getElementById("CtoC")
let ctx_f2 = canvas_f2.getContext("2d")
let canvas_f2t = document.getElementById("CtoCT")
let ctx_f2t = canvas_f2t.getContext("2d")
const width_f2 = canvas_f2.width;
const height_f2 = canvas_f2.height;
let min_x_in_f2 = document.getElementById("f2-x")
let max_x_in_f2 = document.getElementById("f2+x")
let min_y_in_f2 = document.getElementById("f2-y")
let max_y_in_f2 = document.getElementById("f2+y")
let resolution_f2 = document.getElementById("f2r")
let func_in_f2 = document.getElementById("func2")
let l2 = document.getElementById("l2")
update_f2()

function toggle_grid_f2(){
    if (document.getElementById("f2g").checked)
        document.getElementById("CtoCT").style.setProperty("visibility", "visible")
    else document.getElementById("CtoCT").style.setProperty("visibility", "hidden")
}

function update_f2() {
    l2.style.setProperty("visibility", "visible")
    setTimeout(function() {
        ctx_f2.clearRect(0, 0, width_f2, height_f2)
        ctx_f2t.clearRect(0, 0, 2056, 2056)
        const min_x = parseInt(min_x_in_f2.value)
        const max_x = parseInt(max_x_in_f2.value)
        const min_y = parseInt(min_y_in_f2.value)
        const max_y = parseInt(max_y_in_f2.value)
        const res = parseInt(resolution_f2.value)
        if (res <= 0) {
            alert("the resolution has to be positive")
            return
        }
        canvas_f2.setAttribute("height", ""+res)
        canvas_f2.setAttribute("width", ""+res)
        if (min_x >= max_x || min_y >= max_y) {
            alert("the minimum inputs have to be smaller than the maximum ones!")
            return
        }
        let func = translate(func_in_f2.value)

        for (let i = 0; i <= res; i++){
            for (let j = 0; j <= res; j++){
                let tmp = func.call({"x": new Complex(min_x+i*(max_x-min_x)/res,
                                                          min_y+j*(max_y-min_y)/res)})
                ctx_f2.fillStyle = "hsl(" + (tmp.phi/Math.PI*180) + ", 100%," + (1-1/(tmp.rad+1))*60 + "%)";
                ctx_f2.fillRect(i, j, 1, 1)
            }
        }

        const x_step = 2056 / (max_x - min_x)
        const y_step = 2056 / (max_y - min_y)

        ctx_f2t.beginPath();
        ctx_f2t.strokeStyle = "rgb(200, 200, 200)"
        ctx_f2t.lineWidth = 1
        for (let i = 0; i < max_x - min_x; i++) {
            for (let j = 0; j < max_y - min_y; j++) {
                ctx_f2t.rect(i * x_step, j * y_step, x_step, y_step)
            }
        }
        ctx_f2t.stroke()

        ctx_f2t.beginPath()
        ctx_f2t.strokeStyle = "rgb(0, 0, 0)"
        ctx_f2t.lineWidth = 2
        ctx_f2t.moveTo(0, max_y * y_step)
        ctx_f2t.lineTo(2056, max_y * y_step)
        ctx_f2t.moveTo(-min_x*x_step, 0)
        ctx_f2t.lineTo(-min_x*x_step, 2056)
        ctx_f2t.stroke()

        let t_size_2 = 20
        ctx_f2t.font = 2 * t_size_2 + "px Arial"
        ctx_f2t.fillStyle = "rgb(0, 0, 0)"
        if (min_x <= 0) {
            for (let i = max_y; i > min_y; i--) {
                if (i !== 0) {
                    ctx_f2t.fillText(i+"", -min_x * x_step, 2*t_size_2 + (max_y - i) * y_step)
                }
            }
        }
        else{
            for (let i = max_y; i > min_y; i--) {
                if (i !== 0) ctx_f2t.fillText(i+"", 0, 2 * t_size_2 + (max_y - i) * y_step)
            }
        }
        if (min_y <= 0) {
            for (let i = max_x; i > min_x; i--) {
                if (i !== 0) {
                    ctx_f2t.fillText(i + "", 2056 - 2 * t_size_2 - (max_x - i) * x_step, 2 * t_size_2 + max_y * y_step)
                }
            }
        }
        else{
            for (let i = max_x; i > min_x; i--) {
                if (i !== 0) {
                    ctx_f2t.fillText(i + "", 2056 - 2 * t_size_2 - (max_x - i) * x_step, 2056)
                }
            }
        }

        l2.style.setProperty("visibility", "hidden")
    }, 50);
}