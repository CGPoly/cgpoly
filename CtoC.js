class ComplexPolarPlot {
    constructor(name) {
        this.name = name
        this.initialised = false
    }

    initialise(){
        this.initialised = true
        this.canvas = document.getElementById(this.name+"c")
        this.ctx = this.canvas.getContext("2d")
        this.canvas_t = document.getElementById(this.name+"ct")
        this.ctx_t = this.canvas_t.getContext("2d")

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.min_x_in = document.getElementById(this.name+"-x")
        this.max_x_in = document.getElementById(this.name+"+x")
        this.min_y_in = document.getElementById(this.name+"-y")
        this.max_y_in = document.getElementById(this.name+"+y")
        this.resolution = document.getElementById(this.name+"r")

        this.func_in = document.getElementById(this.name+"in")
        this.l2 = document.getElementById(this.name+"l")
        this.toggle_grid()
    }
    
    toggle_grid() {
        if (document.getElementById(this.name + "g").checked)
            document.getElementById(this.name + "ct").style.setProperty("visibility", "visible")
        else document.getElementById(this.name + "ct").style.setProperty("visibility", "hidden")
    }
    
    update() {
        if (!this.initialised) this.initialise()
        this.l2.style.setProperty("visibility", "visible")
        setTimeout(function (that) {
            that.ctx.clearRect(0, 0, that.width, that.height)
            that.ctx_t.clearRect(0, 0, 2056, 2056)
            const min_x = parseInt(that.min_x_in.value)
            const max_x = parseInt(that.max_x_in.value)
            const min_y = parseInt(that.min_y_in.value)
            const max_y = parseInt(that.max_y_in.value)
            const res = parseInt(that.resolution.value)
            if (res <= 0) {
                alert("the resolution has to be positive")
                return
            }
            that.canvas.setAttribute("height", "" + res)
            that.canvas.setAttribute("width", "" + res)
            if (min_x >= max_x || min_y >= max_y) {
                alert("the minimum inputs have to be smaller than the maximum ones!")
                return
            }
            let func = translate(that.func_in.value)

            for (let i = 0; i <= res; i++) {
                for (let j = 0; j <= res; j++) {
                    let tmp = func.call({
                        "x": new Complex(min_x + i * (max_x - min_x) / res,
                            min_y + j * (max_y - min_y) / res)
                    })
                    that.ctx.fillStyle = "hsl(" + (tmp.phi / Math.PI * 180) + ", 100%," + (1 - 1 / (tmp.rad + 1)) * 60 + "%)";
                    that.ctx.fillRect(i, j, 1, 1)
                }
            }

            const x_step = 2056 / (max_x - min_x)
            const y_step = 2056 / (max_y - min_y)

            that.ctx_t.beginPath();
            that.ctx_t.strokeStyle = "rgb(200, 200, 200)"
            that.ctx_t.lineWidth = 1
            for (let i = 0; i < max_x - min_x; i++) {
                for (let j = 0; j < max_y - min_y; j++) {
                    that.ctx_t.rect(i * x_step, j * y_step, x_step, y_step)
                }
            }
            that.ctx_t.stroke()

            that.ctx_t.beginPath()
            that.ctx_t.strokeStyle = "rgb(0, 0, 0)"
            that.ctx_t.lineWidth = 2
            that.ctx_t.moveTo(0, max_y * y_step)
            that.ctx_t.lineTo(2056, max_y * y_step)
            that.ctx_t.moveTo(-min_x * x_step, 0)
            that.ctx_t.lineTo(-min_x * x_step, 2056)
            that.ctx_t.stroke()

            let t_size_2 = 20
            that.ctx_t.font = 2 * t_size_2 + "px Arial"
            that.ctx_t.fillStyle = "rgb(0, 0, 0)"
            if (min_x <= 0) {
                for (let i = max_y; i > min_y; i--) {
                    if (i !== 0) {
                        that.ctx_t.fillText(i + "", -min_x * x_step, 2 * t_size_2 + (max_y - i) * y_step)
                    }
                }
            } else {
                for (let i = max_y; i > min_y; i--) {
                    if (i !== 0) that.ctx_t.fillText(i + "", 0, 2 * t_size_2 + (max_y - i) * y_step)
                }
            }
            if (min_y <= 0) {
                for (let i = max_x; i > min_x; i--) {
                    if (i !== 0) {
                        that.ctx_t.fillText(i + "", 2056 - 2 * t_size_2 - (max_x - i) * x_step, 2 * t_size_2 + max_y * y_step)
                    }
                }
            } else {
                for (let i = max_x; i > min_x; i--) {
                    if (i !== 0) {
                        that.ctx_t.fillText(i + "", 2056 - 2 * t_size_2 - (max_x - i) * x_step, 2056)
                    }
                }
            }

            that.l2.style.setProperty("visibility", "hidden")
        }, 50, this);
    }
}