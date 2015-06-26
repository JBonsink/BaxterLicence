rivets.binders.href = function (el, value) {
    $(el).attr('href', '#' + value);
};
rivets.binders.id = function (el, value) {
    $(el).attr('id', value);
};
rivets.binders.data = function (el, value) {
    $(el).data('obj', value);
};
rivets.formatters.concat = function (value1, value2) {
    return '' + value1 + value2;
};
rivets.formatters.equals = function (value, status1, status2) {
    return (value == status1 || value == status2);
};
rivets.formatters.greaterThan = function (value1, value2) {
    return value1 > value2;
};