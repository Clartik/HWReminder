//#region class-data.ts

interface ClassData {
    readonly classes: Array<Class>;
}

interface Class {
    readonly name: string;
    readonly professor: string;
    readonly assignments: Array<Assignment>;
}

interface Assignment {
    readonly name: string;
    readonly points: Number;
    readonly due_date: string;
    readonly posting: string;
}

//#endregion

const classColumns = document.getElementsByClassName('class-column') as HTMLCollectionOf<HTMLUListElement>;

let dropdownHeaders: HTMLCollectionOf<HTMLSpanElement>;
let dropdownHeadersLabel: HTMLCollectionOf<HTMLSpanElement>;
let dropdownBoxes: HTMLCollectionOf<HTMLUListElement>;

const DROPDOWN_HEADER_TEMPLATE: string = `
    <span class='dropdown-header'>
        <div class='dropdown-header-arrow'></div>
        <span class='dropdown-header-label'>Class Name</span>
    </span>
`;

const DROPDOWN_BOX_TEMPLATE: string = `
    <ul class='dropdown-box hide'></ul>
`;

const ASSIGNMENT_ITEM_TEMPLATE: string = `
    <p class='assignment-label'>Assignment Name</p>
    <button class='assignment-btn hide'>Launch Canvas</button>
`;

loadClassData();

async function loadClassData() {
    const classData: ClassData | null = await window.api.getLocalData('../classes.json') as ClassData | null;

    if (classData === null) {
        console.error('Class Data is Null!')
        return;
    }

    const classes = classData.classes;

    generateDropdownElements(classes);

    dropdownHeaders = document.getElementsByClassName("dropdown-header") as HTMLCollectionOf<HTMLSpanElement>;
    dropdownHeadersLabel = document.getElementsByClassName('dropdown-header-label') as HTMLCollectionOf<HTMLSpanElement>;
    dropdownBoxes = document.getElementsByClassName("dropdown-box") as HTMLCollectionOf<HTMLUListElement>;

    populateDropdownElementsWithData(classes);
    addDropdownEventListeners();
};

function isInt(n: number): boolean {
    return n % 1 === 0;
}

function createClassElement(): HTMLLIElement {
    let classElement = document.createElement('li');
    classElement.classList.add('class-item');
    classElement.innerHTML = DROPDOWN_HEADER_TEMPLATE + DROPDOWN_BOX_TEMPLATE;
    return classElement;
}

function createAssignmentElement(): HTMLLIElement {
    let assignmentElement = document.createElement('li');
    assignmentElement.innerHTML = ASSIGNMENT_ITEM_TEMPLATE;
    return assignmentElement;
}

function generateDropdownElements(classes: Array<Class>): void {
    const amountOfChildrenInEachColumn = Math.floor(classes.length / 2);
    const isAmountOfChildrenOdd = isInt(classes.length / 2) === false;

    for (let columnIndex = 0; columnIndex < classColumns.length; columnIndex++) {
        for (let childIndex = 0; childIndex < amountOfChildrenInEachColumn; childIndex++) {
            let classElement = createClassElement();
            classColumns[columnIndex].appendChild(classElement);
        }
    }
    
    if (isAmountOfChildrenOdd) {
        let classElement = createClassElement();
        classColumns[0].appendChild(classElement);
    }
}

function getTimeTillAssignmentDueDate(assignment: Assignment): string {
    let currentDate = new Date();
    let assignmentDueDate = new Date(assignment.due_date);
    
    if (currentDate > assignmentDueDate)
        return 'Overdue';

    let dayDiff = assignmentDueDate.getDate() - currentDate.getDate();
    let hourDiff = assignmentDueDate.getHours() - currentDate.getHours();
    let minDiff = assignmentDueDate.getMinutes() - currentDate.getMinutes();
    let secDiff = assignmentDueDate.getSeconds() - currentDate.getSeconds();

    let timeTillDueDate = new Date(currentDate);
    timeTillDueDate.setDate(currentDate.getDate() + dayDiff);
    timeTillDueDate.setHours(currentDate.getHours() + hourDiff);
    timeTillDueDate.setMinutes(currentDate.getMinutes() + minDiff);
    timeTillDueDate.setSeconds(currentDate.getSeconds() + secDiff);

    if (dayDiff > 0) {
        if (dayDiff > 1)
            return `Due in ${dayDiff} Days`
        else
            return `Due in a Day`
    }

    if (hourDiff > 0) {
        if (hourDiff > 1)
            return `Due in ${hourDiff} Hours`
        else
            return `Due in an Hour`
    }

    if (minDiff > 0) {
        if (minDiff > 1)
            return `Due in ${minDiff} Minutes`
        else
            return `Due in a Minute`
    }

    if (secDiff > 0) {
        if (secDiff > 1)
            return `Due in ${secDiff} Seconds`
        else
            return `Due in a Second`
    }

    return 'Overdue'
}

function populateDropdownElementsWithData(classes: Array<Class>): void {
    for (let classIndex = 0; classIndex < classes.length; classIndex++) {
        if (dropdownHeadersLabel[classIndex].innerHTML !== null)
            dropdownHeadersLabel[classIndex].innerHTML = classes[classIndex].name;

        for (let assignmentIndex = 0; assignmentIndex < classes[classIndex].assignments.length; assignmentIndex++) {
            let assignmentElement = createAssignmentElement();
            dropdownBoxes[classIndex].append(assignmentElement);

            let timeTillDueDate = getTimeTillAssignmentDueDate(classes[classIndex].assignments[assignmentIndex]);
            
            let assignmentLabel = assignmentElement.querySelector('.assignment-label');
            if (assignmentLabel !== null) {
                assignmentLabel.innerHTML = classes[classIndex].assignments[assignmentIndex].name;

                assignmentLabel.innerHTML += ` - ${timeTillDueDate}`
            }

            let assignmentButton = assignmentElement.querySelector('.assignment-btn');
            if (assignmentButton !== null) {
                assignmentButton.addEventListener('click', () => {
                    window.api.openLink(classes[classIndex].assignments[assignmentIndex].posting);
                })

                if (timeTillDueDate !== 'Overdue') {
                    assignmentButton.classList.remove('hide');
                    
                    dropdownHeaders[classIndex].classList.add('active');
                    dropdownBoxes[classIndex].classList.remove('hide');
                }
            }
        }
    }
}

function addDropdownEventListeners(): void {
    for (let i = 0; i < dropdownHeaders.length; i++) {
        dropdownHeaders[i].addEventListener("click", () => {
            dropdownHeaders[i].classList.toggle('active');
            dropdownHeaders[i].parentElement?.querySelector(".dropdown-box")?.classList.toggle("hide");
        });
    }
}