module kTable {
    export class InputType {
        static Checkbox: string = "checkbox";
        static Date: string = "date";
        static Number: string = "number";
        static Password: string = "password";
        static Radiobutton: string = "radiobutton";
        static TextArea: string = "textarea";
        static File: string = "file";
        static Image: string = "image";
        static Dropdown: string = "dropdown";
        static Hidden: string = "hidden";
    }

    export class Visibility {
        static Fixed: string = "fixed";
        static Hidden: string = "hidden";
        static Visible: string = "visible";
    }

    export class SearchType {
        static Text: number = 0;
        static Dropdown: number = 1;
        static TypeAhead: number = 2;
        static CheckBox: number = 3;
        static Date: number = 4;
        static DateRange: number = 5
    }

    export class Operator {
        static Equals: number = 0;
        static NotEquals: number = 1;
        static LessThan: number = 2;
        static LessThanEquals: number = 3;
        static GreaterThan: number = 4;
        static GreaterThanEquals: number = 5;
        static Contains: number = 6;
        static StartsWith: number = 7;
        static EndsWith: number = 8;
    }
}

var drugUnits = ["MG", "µG", "G", "NG", "IE"];