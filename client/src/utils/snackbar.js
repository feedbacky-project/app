/* eslint-disable */
/*!
 * Snackbar v0.1.14
 * http://polonel.com/Snackbar
 *
 * Copyright 2018 Chris Brame and other contributors
 * Released under the MIT license
 * https://github.com/polonel/Snackbar/blob/master/LICENSE
 */

(function(root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define([], function() {
            return (root.Snackbar = factory());
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = root.Snackbar = factory();
    } else {
        root.Snackbar = factory();
    }
})(this, function() {
    var Snackbar = {};

    Snackbar.current = null;
    var $defaults = {
        text: 'Default Text',
        textColor: '#FFFFFF',
        width: 'auto',
        showAction: true,
        actionText: 'Dismiss',
        actionTextAria: 'Dismiss, Description for Screen Readers',
        alertScreenReader: false,
        actionTextColor: '#4CAF50',
        showSecondButton: false,
        secondButtonText: '',
        secondButtonAria: 'Description for Screen Readers',
        secondButtonTextColor: '#4CAF50',
        backgroundColor: '#323232',
        pos: 'bottom-left',
        duration: 5000,
        customStyle: {},
        onActionClick: function(element) {
            element.style.opacity = 0;
        },
        onSecondButtonClick: function(element) {},
        onClose: function(element) {}
    };

    Snackbar.show = function($options) {
        var options = Extend(true, $defaults, $options);

        if (Snackbar.current) {
            Snackbar.current.style.opacity = 0;
            setTimeout(
                function() {
                    var $parent = this.parentElement;
                    if ($parent)
                        // possible null if too many/fast Snackbars
                        $parent.removeChild(this);
                }.bind(Snackbar.current),
                500
            );
        }

        Snackbar.snackbar = document.createElement('div');
        Snackbar.snackbar.className = 'snackbar-container';
        Snackbar.snackbar.style.width = options.width;
        var bodyStyle = getComputedStyle(document.body);
        var $div = document.createElement("div");
        $div.style.backgroundColor = options.backgroundColor;
        $div.style.borderRadius = bodyStyle.getPropertyValue("--border-radius");
        $div.style.padding = "18px 24px";
        $div.style.width = "100%";
        $div.style.textAlign = "center";
        var $p = document.createElement('p');
        $p.style.margin = 0;
        $p.style.padding = 0;
        $p.style.color = options.textColor;
        $p.style.fontSize = '14px';
        $p.style.fontWeight = 500;
        $p.style.lineHeight = '1em';
        $p.style.display = "inline-block";
        Object.keys(options.customStyle).map(key => {
            $div.style[key] = options.customStyle[key];
        });
        $p.innerHTML = options.text;
        $div.appendChild($p);
        Snackbar.snackbar.appendChild($div);
        Snackbar.snackbar.style.background = bodyStyle.getPropertyValue("--background");

        if (options.showSecondButton) {
            var secondButton = document.createElement('button');
            secondButton.className = 'action';
            secondButton.style.display = "inline-block";
            secondButton.innerHTML = options.secondButtonText;
            secondButton.setAttribute('aria-label', options.secondButtonAria);
            secondButton.style.color = options.secondButtonTextColor;
            secondButton.addEventListener('click', function() {
                options.onSecondButtonClick(Snackbar.snackbar);
            });
            $div.appendChild(secondButton);
        }

        if (options.showAction) {
            var actionButton = document.createElement('button');
            actionButton.className = 'action';
            actionButton.style.display = "inline-block";
            actionButton.innerHTML = options.actionText;
            actionButton.setAttribute('aria-label', options.actionTextAria);
            actionButton.style.color = options.actionTextColor;
            actionButton.addEventListener('click', function() {
                options.onActionClick(Snackbar.snackbar);
            });
            $div.appendChild(actionButton);
        }

        if (options.duration) {
            setTimeout(
                function() {
                    if (Snackbar.current === this) {
                        Snackbar.current.style.opacity = 0;
                        // When natural remove event occurs let's move the snackbar to its origins
                        Snackbar.current.style.top = '-100px';
                        Snackbar.current.style.bottom = '-100px';
                    }
                }.bind(Snackbar.snackbar),
                options.duration
            );
        }

        if (options.alertScreenReader) {
            Snackbar.snackbar.setAttribute('role', 'alert');
        }

        Snackbar.snackbar.addEventListener(
            'transitionend',
            function(event, elapsed) {
                if (event.propertyName === 'opacity' && this.style.opacity === '0') {
                    if (typeof(options.onClose) === 'function')
                        options.onClose(this);

                    this.parentElement.removeChild(this);
                    if (Snackbar.current === this) {
                        Snackbar.current = null;
                    }
                }
            }.bind(Snackbar.snackbar)
        );

        Snackbar.current = Snackbar.snackbar;

        document.body.appendChild(Snackbar.snackbar);
        var $bottom = getComputedStyle(Snackbar.snackbar).bottom;
        var $top = getComputedStyle(Snackbar.snackbar).top;
        Snackbar.snackbar.style.opacity = 1;
        Snackbar.snackbar.className =
            'snackbar-container' + ' snackbar-pos ' + options.pos;
    };

    Snackbar.close = function() {
        if (Snackbar.current) {
            Snackbar.current.style.opacity = 0;
        }
    };

    // Pure JS Extend
    // http://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
    var Extend = function() {
        var extended = {};
        var deep = false;
        var i = 0;
        var length = arguments.length;

        if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
            deep = arguments[0];
            i++;
        }

        var merge = function(obj) {
            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                        extended[prop] = Extend(true, extended[prop], obj[prop]);
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };

        for (; i < length; i++) {
            var obj = arguments[i];
            merge(obj);
        }

        return extended;
    };

    return Snackbar;
});
