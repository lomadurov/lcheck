/*global $*/
$(function () {
    "use strict";
    var lcheck = function ($el, value, options) {
        this.$input = $el;
        this.$label = this.$input.parent();
        this.options = $.extend({}, this.options, options);
        this._stateClasses = $.map(this.options.cssStateClass, function (v) { return v; }).join(' ');
        this.initialize().change(value || (this.$input[0].checked ? 'checked' : 'unchecked') + (this.$input[0].disabled ? ' disable' : ''), true);
        return this;
    };
    lcheck.prototype = {
        initialize: function () {
            if (this.$label.is('label')) {
                this.$label.bind({
                    'mouseenter': $.proxy(this.hoverOn, this),
                    'mouseout': $.proxy(this.hoverOff, this),
                    'click': $.proxy(this.toggle, this)
                });
            }
            this.$input.wrap('<span></span>');
            this.$input.hide();

            this.$span = this.$input.parent();
            this.$span
                .attr('tabindex', 0)
                //.data('state', 'unchecked')
                .addClass('b-lcheck')
                .bind({
                    'focusin': $.proxy(this.focusOn, this),
                    'focusout': $.proxy(this.focusOff, this),
                    'mouseenter': $.proxy(this.hoverOn, this),
                    'mouseout': $.proxy(this.hoverOff, this),
                    'click keypress': $.proxy(this.toggle, this)
                });
            if (!this.options.userSelect) {
                this.$span.addClass(this.options.cssClass['userSelect']);
            }
            return this;
        },
        toggle: function (e) {
            var state;
            if (this.$span.data('disabled')) {
                return false;
            }
            if (e && e.type === 'keypress') {
                if (event.keyCode !== 32) {
                    return false;
                }
            }
            state = (this.$span.data('state') === 'unchecked') ? 'checked' : 'unchecked';
            this.change(state);
            return false;
        },
        change: function (states, notFocus, silent) {
            var self = this;
            if (!states) {
                return this;
            }
            if (!notFocus) {
                this.$span.focus();
            }
            $.each(states.split(' '), function (key, state) {
                if (state === 'disable') {
                    self.$input[0].disabled = "disabled";
                    self.$span
                        .addClass(self.options.cssClass['disabled'])
                        .data('disabled', 'disabled');
                    return true;
                } else if (state === 'enable') {
                    self.$input[0].disabled = undefined;
                    self.$span
                        .removeClass(self.options.cssClass['disabled'])
                        .removeData('disabled');
                    return true;
                }
                self.$span
                    .removeClass(self._stateClasses)
                    .data('state', state)
                    .addClass(self.options.cssStateClass[state]);
                if (state === 'checked') {
                    self.$input[0].checked = "checked";
                } else {
                    self.$input[0].checked = undefined;
                }
                if (silent) {
                    return true;
                }
                self.$input
                    .trigger('lcheck', state)
                    .trigger('change');
                return true;
            });
            return this;
        },
        options: {
            cssClass: {
                hover: 'b-lcheck_hover_yes',
                focus: 'b-lcheck_focus_yes',
                userSelect: 'b-lcheck_select_no',
                disabled: 'b-lcheck_disabled_yes'
            },
            cssStateClass: {
                checked: 'b-lcheck_state_checked',
                unchecked: 'b-lcheck_state_unchecked',
                indeterminate: 'b-lcheck_state_indeterminate'
            },
            userSelect: false,
            tabIndex: 0,
            tabEnable: true
        },
        focusOn: function () {
            this.$span.addClass(this.options.cssClass['focus']);
        },
        focusOff: function () {
            this.$span.removeClass(this.options.cssClass['focus']);
        },
        hoverOn: function () {
            if (this.$span.data('disabled')) {
                return false;
            }
            this.$span.addClass(this.options.cssClass['hover']);
        },
        hoverOff: function () {
            this.$span.removeClass(this.options.cssClass['hover']);
        }
    };
    /**
     * lcheck() // return false, true
     * lcheck({options})
     * lcheck(event)
     */
    $.fn.lcheck = function () {
        var args = Array.prototype.slice.apply(arguments),
            value = args[0] && typeof args[0] === 'string' ? args[0] : undefined,
            options = args[args.length-1] && $.isPlainObject(args[args.length-1]) ? args[args.length-1] : {};
        $(this).each(function () {
            var $this = $(this);

            if ($this.is('input[type="checkbox"]')) {
                // Если чекбокс создан то просто установим необходимое значение
                if ($this.data('checkbox')) {
                    if (value) {
                        $this.data('checkbox').change(value, true);
                    }
                } else {
                    $this.data('checkbox', new lcheck($this, value, options));
                }
            }
        });
        return this;
    };
});