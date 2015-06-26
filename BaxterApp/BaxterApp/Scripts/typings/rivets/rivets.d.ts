declare module rivets {
    function bind(el: JQuery, obj: any): view;

    var binders;
    var formatters;

    class view {
        bind();
        unbind();
        sync();
        publish();
        update(obj: any);
    }
}