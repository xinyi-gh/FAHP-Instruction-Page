let indicatorNum = document.getElementById("indicatorNum").value;
let objectNum = document.getElementById("objectNum").value;
let indicatorWeights = [];
let objectEvaluation = [];
let objectRanks = [];
let objectScores = [];
let objectPage = 0;
let modelStep = 0;

let WINDOW_SIZE = [window.innerWidth, window.innerHeight];

function format(n_target, min, max, decimal=2) {
    n_target = parseFloat(n_target);
    if (n_target < min) n_target = min;
    if (n_target > max) n_target = max;
    return n_target.toFixed(decimal);
}

function update_indicator_inputs() {
    var inputList = []
    let key = 0;
    for (let i = 0; i < indicatorNum; i++) {
        inputList.push(<span key={`updateIndicatorInputs_0_${key++}`}>{document.getElementById("indicatorInputs").className.replace("$", i + 1)}</span>);
        inputList.push(<input key={`updateIndicatorInputs_1_${key++}`} type="text" id={`indicator_${i}`} onChange={update} />);
        inputList.push(<br key={`updateIndicatorInputs_2_${key++}`} />);
    }
    ReactDOM.render(
        inputList,
        document.getElementById("indicatorInputs")
    );
    Array.from(document.getElementsByTagName("span")).map((tag) => {
        if (tag.getAttribute("id") == "indicatorNumDisplay") {
            tag.innerHTML = indicatorNum;
        }
    })
}

function update_object_inputs() {
    var inputList = []
    let key = 0;
    for (let i = 0; i < objectNum; i++) {
        inputList.push(<span key={`updateObjectInputs_0_${key++}`}>{document.getElementById("objectInputs").className.replace("$", i + 1)} </span>);
        inputList.push(<input key={`updateObjectInputs_0_${key++}`} type="text" id={`object_${i}`} onChange={update} />);
        inputList.push(<br key={`updateObjectInputs_0_${key++}`} />);
    }
    ReactDOM.render(
        inputList,
        document.getElementById("objectInputs")
    );
    Array.from(document.getElementsByTagName("span")).map((tag) => {
        if (tag.getAttribute("id") == "objectNumDisplay") {
            tag.innerHTML = objectNum;
        }
    })
}

function update_visualModel() {
    /*
    width=1440, height=820
    RECT_WIDTH=150, RECT_HEIGHT=35
    INDICATOR_RECT_X = 40
    OBJECT_RECT_X = 340
    RECT_Y_BEGIN = 10
    RECT_SPACE = 50
    FONT_SIZE = 20
    */
    const RECT_WIDTH = 0.1 * WINDOW_SIZE[0], RECT_HEIGHT = 0.04 * WINDOW_SIZE[1];
    const INDICATOR_RECT_X = 40;
    const OBJECT_RECT_X = 0.24 * WINDOW_SIZE[0];
    const RECT_Y_BEGIN = 0.01 * WINDOW_SIZE[1];
    const RECT_SPACE = 0.06 * WINDOW_SIZE[1];
    const WEIGHT_TRANSFER_Y = 0.03 * WINDOW_SIZE[1];
    const FONT_SIZE = 20;

    var SVGs = [];
    
    let indicatorY = RECT_Y_BEGIN;
    for (let i = 0; i < indicatorNum; i++) {
        if (modelStep >= 0) { // rect & name
            SVGs.push([<rect
                    width={RECT_WIDTH} height={RECT_HEIGHT} rx={20} ry={20}
                    x={INDICATOR_RECT_X} y={indicatorY}
                    fillOpacity={0} stroke={'#000000'} strokeWidth={5}
                />,
                <text
                    x={INDICATOR_RECT_X + 10} y={indicatorY + 25} fontSize={FONT_SIZE}>
                    {document.getElementById(`indicator_${i}`).value}
                </text>,
            ]);
        }
        if (modelStep >= 1) { // weight
            SVGs.push(<text
                x={0} y={indicatorY + WEIGHT_TRANSFER_Y} fontSize={FONT_SIZE}>
                {indicatorWeights[i]}
            </text>)
        }

        indicatorY += RECT_SPACE;
    }
    
    let objectY = RECT_Y_BEGIN
    for (let i = 0; i < objectNum; i++) {
        if (modelStep >= 2) { // rect & name
            SVGs.push(<rect
                width={RECT_WIDTH} height={RECT_HEIGHT} rx={20} ry={20}
                x={OBJECT_RECT_X} y={objectY}
                fillOpacity={0} stroke={'#000000'} strokeWidth={5}
            />);
            SVGs.push(<text
                x={OBJECT_RECT_X + 10} y={objectY + 25} fontSize={FONT_SIZE}>
                    {document.getElementById(`object_${i}`).value}
            </text>);
        }
        if (modelStep >= 3) { // rank & score
            SVGs.push(<text
                x={OBJECT_RECT_X + RECT_WIDTH + 20} y={objectY + 10} fontSize={FONT_SIZE}>
                    {objectRanks[i][0]}
            </text>);
            SVGs.push(<text
                x={OBJECT_RECT_X + RECT_WIDTH + 10} y={objectY + 30} fontSize={FONT_SIZE}>
                    {objectScores[i]}
            </text>);
        }

        objectY += RECT_SPACE;
    }

    if (modelStep >= 2) { // connecting lines
        let indicatorY = RECT_Y_BEGIN;
        for (let i = 0; i < indicatorNum; i++) {
            let objectY = RECT_Y_BEGIN;
            for (let j = 0; j < objectNum; j++) {
                SVGs.push(<line
                x1={INDICATOR_RECT_X + RECT_WIDTH} y1={indicatorY + RECT_HEIGHT/2}
                x2={OBJECT_RECT_X} y2={objectY + RECT_HEIGHT/2}
                stroke={"#000000"} strokeWidth={2}
                />);
                objectY += RECT_SPACE;
            }
            indicatorY += RECT_SPACE;
        }
    }

    ReactDOM.render(
        SVGs,
        document.getElementById("modelSVG")
    );
}

function update_indicator_matrix() {
    let table = [];
    let headRow = [<td><p>indicators</p></td>]; // <td /> is the corner
    for (let i = 0; i < indicatorNum; i++) {
        headRow.push(<td><p>{document.getElementById(`indicator_${i}`).value}</p></td>);
    }
    table.push(<tr>{headRow}</tr>);
    for (let i = 0; i < indicatorNum; i++) {
        let row = [];
        row.push(<td><p>{document.getElementById(`indicator_${i}`).value}</p></td>);
        for (let j = 0; j < indicatorNum; j++) {
            if (i == j) {
                row.push(<td className="unchangeable"><input type="number" id={`indicatorMatrix_${i}_${j}`} min="0.1" max="0.9" value="0.5" readOnly={true} /></td>);
            } else {
                row.push(<td><input type="number" id={`indicatorMatrix_${i}_${j}`} min="0.1" max="0.9" step="0.1" defaultValue="0.5" onInput={() => {
                    let self = document.getElementById(`indicatorMatrix_${i}_${j}`);
                    let opposite = document.getElementById(`indicatorMatrix_${j}_${i}`);
                    self.value = format(self.value, 0.1, 0.9, 1);
                    opposite.value = format(1 - self.value, 0.1, 0.9, 1);
                    
                    for (let k = 0; k < indicatorNum; k++) {
                        if (k == i || k == j) continue;
                        let a = document.getElementById(`indicatorMatrix_${i}_${k}`);
                        let b = document.getElementById(`indicatorMatrix_${j}_${k}`);
                        b.value = format(a.value - self.value + 0.5, 0.1, 0.9, 1);
                        a.value = format(self.value - 0.5 + parseFloat(b.value), 0.1, 0.9, 1);

                        let oppositeA = document.getElementById(`indicatorMatrix_${k}_${i}`);
                        let oppositeB = document.getElementById(`indicatorMatrix_${k}_${j}`);
                        oppositeA.value = format(1 - a.value, 0.1, 0.9, 1);
                        oppositeB.value = format(1 - b.value, 0.1, 0.9, 1);
                    }
                    update();
                }} /></td>);
            }
        }
        table.push(<tr>{row}</tr>);
    }
    ReactDOM.render(
        table,
        document.getElementById("indicatorMatrix")
    );
}

function update_object_matrix() {
    let table = [<tr><td><p></p></td><td><p>Excellent</p></td><td><p>Good</p></td><td><p>Poor</p></td></tr>];
    for (let n = 0; n < objectNum; n++) {
        for (let i = 0; i < indicatorNum; i++) {
            // style control the displaying, so all the input bars can be got normally
            table.push(<tr style={{display: (n == objectPage) ? "" : "none"}}>
                <td><p>{document.getElementById(`indicator_${i}`).value}</p></td>
                <td><input type="number" id={`objectMatrix${n}_${i}_0`} min="0" max="1" step="0.1" defaultValue="0.33" onInput={() => {
                    let first = document.getElementById(`objectMatrix${n}_${i}_0`);
                    let second = document.getElementById(`objectMatrix${n}_${i}_1`);
                    let third = document.getElementById(`objectMatrix${n}_${i}_2`);
                    first.value = format(first.value, 0, 1);
                    second.value = format(1 - first.value - third.value, 0, 1);
                    third.value = format(1 - first.value - second.value, 0, 1);
                    update();
                }} /></td>
                <td><input type="number" id={`objectMatrix${n}_${i}_1`} min="0" max="1" step="0.1" defaultValue="0.33" onInput={() => {
                    let first = document.getElementById(`objectMatrix${n}_${i}_0`);
                    let second = document.getElementById(`objectMatrix${n}_${i}_1`);
                    let third = document.getElementById(`objectMatrix${n}_${i}_2`);
                    second.value = format(second.value, 0, 1);
                    first.value = format(1 - second.value - third.value, 0, 1);
                    third.value = format(1 - first.value - second.value, 0, 1);
                    update();
                }} /></td>
                <td><input type="number" id={`objectMatrix${n}_${i}_2`} min="0" max="1" step="0.1" defaultValue="0.33" onInput={() => {
                    let first = document.getElementById(`objectMatrix${n}_${i}_0`);
                    let second = document.getElementById(`objectMatrix${n}_${i}_1`);
                    let third = document.getElementById(`objectMatrix${n}_${i}_2`);
                    third.value = format(third.value, 0, 1);
                    first.value = format(1 - second.value - third.value, 0, 1);
                    second.value = format(1 - first.value - third.value, 0, 1);
                    update();
                }} /></td>
            </tr>);
        }
    }
    ReactDOM.render(
        table,
        document.getElementById("objectMatrix")
    );
}

function calculate_indicator_weight() {
    indicatorWeights = [];
    
    let n = indicatorNum;
    for (let i = 0; i < indicatorNum; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) sum += parseFloat(document.getElementById(`indicatorMatrix_${i}_${j}`).value);
        let result = (sum + n/2 - 1) / (n * (n - 1));
        indicatorWeights.push(result.toFixed(2));
    }
}

function calculate_object_score() {
    objectEvaluation = [];
    objectRanks = [];

    for (let n = 0; n < objectNum; n++) {
        let r = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < indicatorNum; j++) {
                r[i] += indicatorWeights[j] * document.getElementById(`objectMatrix${n}_${j}_${i}`).value;
            }
        }
        objectEvaluation.push(r.map((score) => {return score.toFixed(2)}));

        let max = Math.max.apply(null, r);
        let rank = "";
        if (r[0] == max) rank += "Excellent/";
        if (r[1] == max) rank += "Good/";
        if (r[2] == max) rank += "Poor/";
        objectRanks.push(rank.slice(0, rank.length - 1)); // remove the last "/"

        objectScores.push((3 * r[0] + 2 * r[1] + 1 * r[2]).toFixed(2));
    }
}

function update_formula1() {
    let rangeArray = [];
    for (let i = 0; i < indicatorNum; i++) rangeArray.push(i);
    let numerator = <mrow>
        {rangeArray.map((i) => {
            return [<mn>{document.getElementById(`indicatorMatrix_0_${i}`).value}</mn>, <mo>+</mo>];
        })}
        <mfrac>
            <mi>{indicatorNum}</mi>
            <mn>2</mn>
        </mfrac>
        <mo>-</mo>
        <mn>1</mn>
    </mrow>;
    
    let denominator = <mrow>
        <mi>{indicatorNum}</mi>
        <mo>&#xD7;</mo>
        <mo>(</mo>
        <mi>{indicatorNum}</mi>
        <mo>-</mo>
        <mn>1</mn>
        <mo>)</mo>
    </mrow>;
    ReactDOM.render(
        [numerator, denominator],
        document.getElementById("formula1")
    );
}

function update_formula2() {
    let contents = indicatorWeights.map((weight) => {
        return <mn>{weight}</mn>;
    });
    for (let i = 1; i < contents.length; i += 2) contents.splice(i, 0, <mo>,</mo>);
    let formula = [
        <mi>W</mi>,
        <mo>=</mo>,
        <mo>{"("}</mo>,
        contents,
        <mo>{")"}</mo>,
    ]
    ReactDOM.render(
        formula,
        document.getElementById("formula2")
    );
}

function update_formula34() {
    let w = indicatorWeights.map((weight) => {
        return <mn>{weight}</mn>;
    });
    for (let i = 1; i < w.length; i += 2) w.splice(i, 0, <mo>,</mo>);

    let r = objectEvaluation[0].map((score) => {
        return <mn>{score}</mn>;
    });
    for (let i = 1; i < r.length; i += 2) r.splice(i, 0, <mo>,</mo>);

    let wf = [];
    for (let i = 0; i < indicatorNum; i++) {
        wf.push(<mtr>
            <mtd>
                <mn>{document.getElementById(`objectMatrix0_${i}_0`).value}</mn>
            </mtd>
            <mtd>
                <mn>{document.getElementById(`objectMatrix0_${i}_1`).value}</mn>
            </mtd>
            <mtd>
                <mn>{document.getElementById(`objectMatrix0_${i}_2`).value}</mn>
            </mtd>
        </mtr>)
    }
    let formula = [
        <mi>R</mi>,
        <mo>=</mo>,
        <mfenced>
            <mrow>
                {w}
            </mrow>
        </mfenced>,
        <mo>&#xD7;</mo>,
        <mo>{"["}</mo>,
        <mtable>
            {wf}
        </mtable>,
        <mo>{"]"}</mo>,
        <mo>=</mo>,
        <mfenced>
            <mrow>
                {r}
            </mrow>
        </mfenced>,
    ];
    ReactDOM.render(
        formula,
        document.getElementById("formula3")
    );
    
    ReactDOM.render(
        formula.slice(0, 3),
        document.getElementById("formula4")
    );
    ReactDOM.render(
        formula.slice(0, 3),
        document.getElementById("formula4_")
    );
}

function object_page_switch(isNext) {
    if (isNext) {
        if (objectPage < objectNum - 1) objectPage++;
    } else {
        if (objectPage > 0) objectPage--;
    }
    update();
}

function update() { // pay attention to the order
    indicatorNum = document.getElementById("indicatorNum").value;
    objectNum = document.getElementById("objectNum").value;
    if (objectNum < objectPage + 1) objectPage = parseInt(objectNum) - 1;
    
    update_indicator_inputs();
    update_object_inputs();
    update_indicator_matrix();
    update_object_matrix();
    calculate_indicator_weight();
    calculate_object_score();
    update_formula1();
    update_formula2();
    update_formula34();
    update_visualModel();
    ReactDOM.render(
        [objectPage + 1, "/", objectNum],
        document.getElementById("objectPage")
    );
    ReactDOM.render(
        objectRanks[0],
        document.getElementById("object1Rank")
    );
    ReactDOM.render(
        objectScores[0],
        document.getElementById("object1Score")
    );
}

function win_onresize() {
    WINDOW_SIZE = [window.innerWidth, window.innerHeight];
    document.getElementsByTagName("svg")[0].setAttribute("width", 0.41 * WINDOW_SIZE[0]);
    document.getElementsByTagName("svg")[0].setAttribute("height", 0.4 * WINDOW_SIZE[1]);

    update();
}
function win_onscroll() {
    let t = document.body.getBoundingClientRect().top
    document.getElementById("indicatorMatrix").parentElement.style.display = (t < -1000 && t > -2500) ? "" : "none";
    document.getElementById("objectMatrix").parentElement.style.display = (t < -2500 && t > -4700) ? "" : "none";

    let previous = modelStep
    if (t < 0) modelStep = 0;
    if (t < -2070) modelStep = 1;
    if (t < -2700) modelStep = 2;
    if (t < -3850) modelStep = 3;
    if (modelStep != previous) update_visualModel();
}

window.onresize = win_onresize;
window.onscroll = win_onscroll;

update();
win_onresize();
win_onscroll();
