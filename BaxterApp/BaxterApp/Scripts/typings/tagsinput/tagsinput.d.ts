interface JQuery {
    tagsinput(opt: tagsinput.Options) : JQuery
} 

declare module tagsinput {
    interface Options {
        itemValue: string;
        itemText: string;
        maxTags: number;
        typeaheadjs: Twitter.Typeahead.Options;
    }
}