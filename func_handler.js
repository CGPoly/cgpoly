let func = {}

/**
 *
 * @param name name of the new function
 * @param type the type. 1
 *  0: "normal" reel plot with to axes
 *  1: polar plot complex to complex
 */
function add_func(name, type){
    if (type === 0) func[name] = new RtoR(name)
    if (type === 1) func[name] = new ComplexPolarPlot(name)
}

function update(name) {
    func[name].update()
}

function toggle_grid(name){
    func[name].toggle_grid()
}