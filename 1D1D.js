let canvas_f1 = document.getElementById("1D1D")
let ctx_f1 = canvas_f1.getContext("2d")
const width_f1 = canvas_f1.width;
const height_f1 = canvas_f1.height;
let min_x_in_f1 = document.getElementById("f1-x")
let max_x_in_f1 = document.getElementById("f1+x")
let min_y_in_f1 = document.getElementById("f1-y")
let max_y_in_f1 = document.getElementById("f1+y")
let resolution_f1 = document.getElementById("f1r")
let func_in_f1 = document.getElementById("func1")
const buffer = 15
update_f1()

function update_f1() {
    ctx_f1.clearRect(0, 0, width_f1, height_f1)
    const min_x = parseInt(min_x_in_f1.value)
    const max_x = parseInt(max_x_in_f1.value)
    const min_y = parseInt(min_y_in_f1.value)
    const max_y = parseInt(max_y_in_f1.value)
    const res = parseInt(resolution_f1.value)
    if (res <= 0) {
        alert("the resolution has to be positive")
        return
    }
    if (min_x >= max_x || min_y >= max_y){
        alert("the minimum inputs have to be smaller than the maximum ones!")
        return
    }
    const x_step = (width_f1 - 2 * buffer) / (max_x - min_x)
    const y_step = (height_f1 - 2 * buffer) / (max_y - min_y)

    ctx_f1.beginPath();
    ctx_f1.strokeStyle = "rgb(200, 200, 200)"
    ctx_f1.lineWidth = 1
    for (let i = 0; i < max_x - min_x; i++) {
        for (let j = 0; j < max_y - min_y; j++) {
            ctx_f1.rect(i * x_step + buffer, j * y_step + buffer, x_step, y_step)
        }
    }
    ctx_f1.stroke()

    ctx_f1.beginPath()
    ctx_f1.strokeStyle = "rgb(0, 0, 0)"
    ctx_f1.lineWidth = 2
    ctx_f1.moveTo(buffer, buffer + max_y * y_step)
    ctx_f1.lineTo(width_f1-buffer, buffer + max_y * y_step)
    ctx_f1.moveTo(-min_x*x_step+buffer, buffer)
    ctx_f1.lineTo(-min_x*x_step+buffer, height_f1-buffer)
    ctx_f1.stroke()

    ctx_f1.font = 2 * buffer + "px Arial"
    if (min_x <= 0) {
        for (let i = max_y; i >= min_y; i--) {
            if (i !== 0) {
                ctx_f1.clearRect(-min_x * x_step, 2*buffer + (max_y - i) * y_step-2*buffer,
                    ctx_f1.measureText(i+"").width, 2.5*buffer)
                ctx_f1.fillText(i+"", -min_x * x_step, 2*buffer + (max_y - i) * y_step)
            }
        }
    }
    else{
        for (let i = max_y; i >= min_y; i--) {
            ctx_f1.clearRect(0, 2*buffer + (max_y - i) * y_step-2*buffer,
                ctx_f1.measureText(i+"").width, 2*buffer)
            if (i !== 0) ctx_f1.fillText(i+"", 0, 2 * buffer + (max_y - i) * y_step)
        }
    }
    if (min_y <= 0) {
        for (let i = max_x; i >= min_x; i--) {
            if (i !== 0) {
                ctx_f1.clearRect(width_f1 - 2 * buffer - (max_x - i) * x_step, max_y * y_step,
                    ctx_f1.measureText(i + "").width, 2.5 * buffer)
                ctx_f1.fillText(i + "", width_f1 - 2 * buffer - (max_x - i) * x_step, 2 * buffer + max_y * y_step)
            }
        }
    }
    else{
        for (let i = max_x; i >= min_x; i--) {
            if (i !== 0) {
                ctx_f1.clearRect(width_f1 - 2 * buffer - (max_x - i) * x_step, height_f1-2*buffer,
                    ctx_f1.measureText(i + "").width, 2.5 * buffer)
                ctx_f1.fillText(i + "", width_f1 - 2 * buffer - (max_x - i) * x_step, height_f1)
            }
        }
    }

    let func = translate(func_in_f1.value)
    let bad_last_pos = true
    ctx_f1.beginPath()
    ctx_f1.strokeStyle = "rgb(255, 0, 0)"
    ctx_f1.lineWidth = 2
    if (func instanceof Complex){
        if (min_y <= func.re && func.re <= max_y){
            ctx_f1.moveTo(width_f1-buffer, height_f1/2 - func.re*y_step)
            ctx_f1.lineTo(buffer, height_f1/2 - func.re*y_step)
        }
    }
    else {
        for (let x = min_x; x <= max_x; x+=1/res) {
            let y = func.call({"x": new Complex(x, 0)})
            if (parseFloat((""+y.im).slice(0, 10)) !== 0) continue // damit keine komplexen Zahlen abgebildet werden
            y = y.re
            if (min_y <= y && y <= max_y) {
                if (bad_last_pos) ctx_f1.moveTo(-min_x*x_step+buffer + x*x_step,
                                             max_y*y_step+buffer - y*y_step)
                else ctx_f1.lineTo( -min_x*x_step+buffer + x*x_step,
                                 max_y*y_step+buffer - y*y_step)
                bad_last_pos = false
            } else bad_last_pos = true
        }
    }
    ctx_f1.stroke()
}
