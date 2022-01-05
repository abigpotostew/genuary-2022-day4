
export const createGrid=(p5)=>{
    const left_x = int(p5.width * -0.5)
    const right_x = int(p5.width * 1.5)
    const top_y = int(p5.height * -0.5)
    const bottom_y = int(p5.height * 1.5)

    const resolution = int(p5.width * 0.01)

    const num_columns = (right_x - left_x) / resolution
    const  num_rows = (bottom_y - top_y) / resolution
    const grid = [];
    const  default_angle = p5.PI * 0.25
    for (let colm = 0; colm < num_columns; colm++) {
        grid[colm]=[];
        for (let row = 0; row < num_rows; row++) {
            grid[colm][row] = (row / num_rows) * p5.PI
        }
    }
}
