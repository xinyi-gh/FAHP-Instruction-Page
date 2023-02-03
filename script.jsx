let indicatorNum = document.getElementById("indicatorNum").value;
let objectNum = document.getElementById("objectNum").value;
let indicatorWeights = [];
let objectPage = 0;

function update_indicator_inputs() {
    var inputList = []
    let key = 0;
    for (let i = 0; i < indicatorNum; i++) {
        inputList.push(<span key={`updateIndicatorInputs_0_${key++}`}>indicator{i + 1}'s name: </span>);
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
        inputList.push(<span key={`updateObjectInputs_0_${key++}`}>object{i + 1}'s name </span>);
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
    // DEBUG
    let renderIndicator = true, renderObject = true;
    // DEBUG

    const RECT_WIDTH = 150, RECT_HEIGHT = 35;
    const INDICATOR_RECT_X = 40;
    const OBJECT_RECT_X = 340;
    const RECT_Y_BEGIN = 10
    const RECT_SPACE = 50;

    var SVGs = [];
    if (renderIndicator && renderObject) { // draw the connecting lines
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
    if (renderIndicator) {
        let indicatorY = RECT_Y_BEGIN;
        for (let i = 0; i < indicatorNum; i++) {
            SVGs.push(<rect
                width={RECT_WIDTH} height={RECT_HEIGHT} rx={20} ry={20}
                x={INDICATOR_RECT_X} y={indicatorY}
                fillOpacity={0} stroke={'#000000'} strokeWidth={5}
            />);
            SVGs.push(<text
                x={INDICATOR_RECT_X + 10} y={indicatorY + 25} fontSize={20}>
                {document.getElementById(`indicator_${i}`).value}
            </text>);
            SVGs.push(<text
                x={INDICATOR_RECT_X - 40} y={indicatorY + 25} fontSize={20}>
                {indicatorWeights[i]}
            </text>)

            indicatorY += RECT_SPACE;
        }
    }
    if (renderObject) {
        let objectY = RECT_Y_BEGIN
        for (let i = 0; i < objectNum; i++) {
            SVGs.push(<rect
                width={RECT_WIDTH} height={RECT_HEIGHT} rx={20} ry={20}
                x={OBJECT_RECT_X} y={objectY}
                fillOpacity={0} stroke={'#000000'} strokeWidth={5}
            />);
            SVGs.push(<text
                x={OBJECT_RECT_X + 10} y={objectY + 25} fontSize={20}>
                {document.getElementById(`object_${i}`).value}
            </text>);

            objectY += RECT_SPACE;
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
                    if (self.value < 0.1) self.value = 0.1;
                    if (self.value > 0.9) self.value = 0.9;
                    document.getElementById(`indicatorMatrix_${j}_${i}`).value = (1 - self.value).toFixed(1);
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
                    if (first.value < 0) first.value = 0;
                    if (first.value > 1) first.value = 1;
                    second.value = (1 - first.value - third.value < 0) ? 0 : (1 - first.value - third.value).toFixed(2);
                    third.value = (1 - first.value - second.value < 0) ? 0 : (1 - first.value - second.value).toFixed(2);
                    update();
                }} /></td>
                <td><input type="number" id={`objectMatrix${n}_${i}_1`} min="0" max="1" step="0.1" defaultValue="0.33" onInput={() => {
                    let first = document.getElementById(`objectMatrix${n}_${i}_0`);
                    let second = document.getElementById(`objectMatrix${n}_${i}_1`);
                    let third = document.getElementById(`objectMatrix${n}_${i}_2`);
                    if (second.value < 0) second.value = 0;
                    if (second.value > 1) second.value = 1;
                    first.value = (1 - second.value - third.value < 0) ? 0 : (1 - second.value - third.value).toFixed(2);
                    third.value = (1 - first.value - second.value < 0) ? 0 : (1 - first.value - second.value).toFixed(2);
                    update();
                }} /></td>
                <td><input type="number" id={`objectMatrix${n}_${i}_2`} min="0" max="1" step="0.1" defaultValue="0.33" onInput={() => {
                    let first = document.getElementById(`objectMatrix${n}_${i}_0`);
                    let second = document.getElementById(`objectMatrix${n}_${i}_1`);
                    let third = document.getElementById(`objectMatrix${n}_${i}_2`);
                    if (third.value < 0) third.value = 0;
                    if (third.value > 1) third.value = 1;
                    first.value = (1 - second.value - third.value < 0) ? 0 : (1 - second.value - third.value).toFixed(2);
                    second.value = (1 - first.value - third.value < 0) ? 0 : (1 - first.value - third.value).toFixed(2);
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

function calculate() {
    indicatorWeights = [];
    
    let n = indicatorNum;
    for (let i = 0; i < indicatorNum; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) sum += parseFloat(document.getElementById(`indicatorMatrix_${i}_${j}`).value);
        let result = (sum + n/2 - 1) / (n * (n - 1));
        indicatorWeights.push(result.toFixed(2));
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
        <mo>{"{"}</mo>,
        contents,
        <mo>{"}"}</mo>,
    ]
    ReactDOM.render(
        formula,
        document.getElementById("formula2")
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
    calculate();
    update_formula1();
    update_formula2();
    update_visualModel();
    ReactDOM.render(
        [objectPage + 1, "/", objectNum],
        document.getElementById("objectPage")
    );
}

update();