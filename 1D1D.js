class RtoR {
    constructor(name, buffer=15) {
        this.name = name
        this.initialised = false
        this.buffer = buffer
    }
    
    initialise() {
        this.initialised = true
        this.canvas = document.getElementById(this.name+"c")
        this.ctx = this.canvas.getContext("2d")
        this.width = this.canvas.width
        this.height = this.canvas.height
        this.min_x_in = document.getElementById(this.name+"-x")
        this.max_x_in = document.getElementById(this.name+"+x")
        this.min_y_in = document.getElementById(this.name+"-y")
        this.max_y_in = document.getElementById(this.name+"+y")
        this.resolution = document.getElementById(this.name+"r")
        this.func_in = document.getElementById(this.name+"in")
    }

    update() {
        if (!this.initialised) this.initialise()
        this.ctx.clearRect(0, 0, this.width, this.height)
        const min_x = parseInt(this.min_x_in.value)
        const max_x = parseInt(this.max_x_in.value)
        const min_y = parseInt(this.min_y_in.value)
        const max_y = parseInt(this.max_y_in.value)
        const res = parseInt(this.resolution.value)
        if (res <= 0) {
            alert("the resolution has to be positive")
            return
        }
        if (min_x >= max_x || min_y >= max_y) {
            alert("the minimum inputs have to be smaller than the maximum ones!")
            return
        }
        const x_step = (this.width - 2 * this.buffer) / (max_x - min_x)
        const y_step = (this.height - 2 * this.buffer) / (max_y - min_y)

        this.ctx.beginPath();
        this.ctx.strokeStyle = "rgb(200, 200, 200)"
        this.ctx.lineWidth = 1
        for (let i = 0; i < max_x - min_x; i++) {
            for (let j = 0; j < max_y - min_y; j++) {
                this.ctx.rect(i * x_step + this.buffer, j * y_step + this.buffer, x_step, y_step)
            }
        }
        this.ctx.stroke()

        this.ctx.beginPath()
        this.ctx.strokeStyle = "rgb(0, 0, 0)"
        this.ctx.lineWidth = 2
        this.ctx.moveTo(this.buffer, this.buffer + max_y * y_step)
        this.ctx.lineTo(this.width - this.buffer, this.buffer + max_y * y_step)
        this.ctx.moveTo(-min_x * x_step + this.buffer, this.buffer)
        this.ctx.lineTo(-min_x * x_step + this.buffer, this.height - this.buffer)
        this.ctx.stroke()

        this.ctx.font = 2 * this.buffer + "px Arial"
        if (min_x <= 0) {
            for (let i = max_y; i >= min_y; i--) {
                if (i !== 0) {
                    this.ctx.clearRect(-min_x * x_step, 2 * this.buffer + (max_y - i) * y_step - 2 * this.buffer,
                        this.ctx.measureText(i + "").width, 2.5 * this.buffer)
                    this.ctx.fillText(i + "", -min_x * x_step, 2 * this.buffer + (max_y - i) * y_step)
                }
            }
        } else {
            for (let i = max_y; i >= min_y; i--) {
                this.ctx.clearRect(0, 2 * this.buffer + (max_y - i) * y_step - 2 * this.buffer,
                    this.ctx.measureText(i + "").width, 2 * this.buffer)
                if (i !== 0) this.ctx.fillText(i + "", 0, 2 * this.buffer + (max_y - i) * y_step)
            }
        }
        if (min_y <= 0) {
            for (let i = max_x; i >= min_x; i--) {
                if (i !== 0) {
                    this.ctx.clearRect(this.width - 2 * this.buffer - (max_x - i) * x_step, max_y * y_step,
                        this.ctx.measureText(i + "").width, 2.5 * this.buffer)
                    this.ctx.fillText(i + "", this.width - 2 * this.buffer - (max_x - i) * x_step, 
                                                      2 * this.buffer + max_y * y_step)
                }
            }
        } else {
            for (let i = max_x; i >= min_x; i--) {
                if (i !== 0) {
                    this.ctx.clearRect(
                        this.width - 2 * this.buffer - (max_x - i) * x_step, this.height - 2 * this.buffer,
                        this.ctx.measureText(i + "").width, 2.5 * this.buffer
                    )
                    this.ctx.fillText(i + "", this.width - 2 * this.buffer - (max_x - i) * x_step, 
                        this.height)
                }
            }
        }

        let func = translate(this.func_in.value)
        let bad_last_pos = true
        this.ctx.beginPath()
        this.ctx.strokeStyle = "rgb(255, 0, 0)"
        this.ctx.lineWidth = 2
        if (func instanceof Complex) {
            if (min_y <= func.re && func.re <= max_y) {
                this.ctx.moveTo(this.width - this.buffer, this.height / 2 - func.re * y_step)
                this.ctx.lineTo(this.buffer, this.height / 2 - func.re * y_step)
            }
        } else {
            for (let x = min_x; x <= max_x; x += 1 / res) {
                let y = func.call({"x": new Complex(x, 0)})
                if (parseFloat(("" + y.im).slice(0, 10)) !== 0) continue // damit keine komplexen Zahlen abgebildet werden
                y = y.re
                if (min_y <= y && y <= max_y) {
                    if (bad_last_pos) this.ctx.moveTo(-min_x * x_step + this.buffer + x * x_step,
                        max_y * y_step + this.buffer - y * y_step)
                    else this.ctx.lineTo(-min_x * x_step + this.buffer + x * x_step,
                        max_y * y_step + this.buffer - y * y_step)
                    bad_last_pos = false
                } else bad_last_pos = true
            }
        }
        this.ctx.stroke()
    }
}
