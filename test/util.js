const fill_template = function (template_str, params) {
  return new Function('return `' + template_str + '`;').call(params);
};

export default {
  fill_template,
};
