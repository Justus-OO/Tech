$(() => {
    $("#modalPurchase").on("shown.bs.modal", function (event) {
        var button = $(event.relatedTarget);
        var item = button.data("item");
        var modal = $(this);
        modal.find("#plan").text(item.name);
        modal.find("#amount").text(item.price);
        modal.find("input[name=amount]").val(item.price);
        modal.find("input[name=plan_id]").val(item._id);
        modal
            .find('.modal-body input[name="amount"]')
            .val(item.price)
            .attr("readonly", true);
    });

    $(".redeembtn").on("click", async function (e) {
        e.preventDefault();
        $(this)
            .html(
                `<span class=""><i class="fa fa-spinner fa-spin"></i> please wait...</span>`
            )
            .attr("disabled", "");

        $(".invalid-feedback, .valid-feedback").empty();
        $("input[name=vrusername]").removeClass("is-invalid");

        let username = $("input[name=vrusername]").val();

        if (!username) {
            $(this)
                .html("{{ __('connect_with_voucher') }}")
                .removeAttr("disabled");

            $("input[name=vrusername]")
                .addClass("is-invalid")
                .addClass("has-error")
                .after(
                    '<span class="invalid-feedback">Please provide the transaction number</span>'
                );
            return;
        }

        let _request = await fetch(
            $("form[name=check-voucher]").attr("action"),
            {
                method: "post",
                body: JSON.stringify({
                    username,
                }),
                headers: {
                    "content-type": "application/json",
                    accept: "application/json",
                },
            }
        );

        let _response = await _request.json();

        if (_response.errors) {
            $(this)
                .html("{{ __('connect_with_voucher') }}")
                .removeAttr("disabled");

            $("input[name=username]")
                .addClass("is-invalid")
                .addClass("has-error")
                .after(
                    `<span class="invalid-feedback">${_response.message}</span>`
                );
            return;
        }

        if (_response.success) {
            $("input[name=vrusername]")
                .addClass("is-valid")
                .after(
                    `<span class="valid-feedback">${_response.message.replace(
                        "[x]",
                        '<span id="count"></span>'
                    )}.</span>`
                );
            let _timer = 10;

            $(this)
                .html("{{__('connect_with_voucher')}}")
                .removeAttr("disabled");

            setInterval(() => {
                if (_timer <= 0) {
                    $("input[name=vrusername]").val(_response.code);
                    window.location.href =
                        "http://login.wifi/login?username=" + _response.code;
                    return;
                }
                $("#count").text(_timer);
                _timer--;
            }, 1000);
        }

        if (!_response.success) {
            $(this)
                .html("{{ __('connect_with_voucher') }}")
                .removeAttr("disabled");

            $("input[name=vrusername]")
                .addClass("is-invalid")
                .after(
                    `<span class="fw-bold invalid-feedback">${_response.message}</span>`
                );
            return;
        }
    });

    $(".trxvalidate").on("click", async function (e) {
        e.preventDefault();
        $(this)
            .html(
                `<span class=""><i class="fa fa-spinner fa-spin"></i> please wait...</span>`
            )
            .attr("disabled", "");

        $(".invalid-feedback, .valid-feedback").empty();
        $("input[name=transaction]").removeClass("is-invalid");

        let transaction = $("textarea[name=transaction]").val();
        let trxsplit = transaction.split(" ")[0];

        if (!transaction) {
            $(this)
                .html("Connect with Transaction Number")
                .removeAttr("disabled");
            $("textarea[name=transaction]")
                .addClass("is-invalid")
                .addClass("has-error")
                .after(
                    '<span class="invalid-feedback">Please provide the transaction number</span>'
                );
            return;
        }

        let _request = await fetch(
            $("form[name=change-method-login]").attr("action"),
            {
                method: "post",
                body: JSON.stringify({
                    transaction: trxsplit,
                }),
                headers: {
                    "content-type": "application/json",
                    accept: "application/json",
                },
            }
        );

        let _response = await _request.json();

        if (_response.errors) {
            $(this)
                .html("Connect with Transaction Number")
                .removeAttr("disabled");
            $("textarea[name=transaction]")
                .addClass("is-invalid")
                .addClass("has-error")
                .after(
                    `<span class="invalid-feedback">${_response.message}</span>`
                );
            return;
        }

        if (_response.success) {
            $("textarea[name=transaction]")
                .addClass("is-valid")
                .after(
                    `<span class="valid-feedback">${_response.message.replace(
                        "[x]",
                        '<span id="count"></span>'
                    )}. You can also use the transaction number as voucher to be connected</span>`
                );
            let _timer = 10;

            $(this)
                .html("Connect with Transaction Number")
                .removeAttr("disabled");

            setInterval(() => {
                if (_timer <= 0) {
                    $("input[name=username]").val(_response.code);
                    window.location.href =
                        "http://login.wifi/login?username=" + _response.code;
                    return;
                }
                $("#count").text(_timer);
                _timer--;
            }, 1000);
        }

        if (!_response.success) {
            $(this)
                .html("Connect with Transaction Number")
                .removeAttr("disabled");

            $("textarea[name=transaction]")
                .addClass("is-invalid")
                .after(
                    `<span class="fw-bold invalid-feedback">${_response.message}</span>`
                );
            return;
        }
    });
});