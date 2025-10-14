$(document).ready(function () {
    if (localStorage.getItem("phone")) {
        $("input[name=phone]").val(localStorage.getItem("phone"));
    }

    $(".ad").each(function () {
        if ($(this).is(":empty")) {
            $(this).remove();
        } else {
            $(this).remove();
        }
    });

    if (localStorage.getItem("last_purchase")) {
        let lp = localStorage.getItem("last_purchase");

        $(`.prc-${lp}`).addClass("bg-teal-200");
        $(`.prc-${lp}-helper`).html(
            `<span class="badge bg-danger">Popular</span>`
        );
    }
    // get cookie value
    $("#pay").on("click", async function (e) {
        e.preventDefault();
        $(".gateway-feedback").empty();

        let data = {};
        let form = $("form[name=pay-ajax]");
        let paymethod = $("input[name=gateway]").val();
        let action = form.attr("action");
        var phone = $("input[name=phone]").val();

        if (
            paymethod == "mpesa" ||
            paymethod == "pesapal" ||
            paymethod == "kopokopo" ||
            paymethod == "wallet" ||
            paymethod == "paypal"
        ) {
            if (phone == "" || phone.length < 10) {
                $("input[name=phone]")
                    .addClass("is-invalid")
                    .addClass("has-error")
                    .after(
                        '<span class="invalid-feedback">Please provide a Safaricom  phone number</span>'
                    );
                return false;
            }

            data = {
                phone,
            };
        } else if (paymethod == "paystack" || paymethod == "Paypal") {
            data = {
                email: $("input[name=email]").val(),
                amount: $("select[name=amount]").val(),
                code: $("input[name=code]").val(),
            };
        }

        var amount ="1";
            //$("select[name=amount]").val() || $("input[name=amount]").val();
        data.code = $("input[name=code]").val();
        data.amount = amount;
        data.method = paymethod;
        data.allow_sms = $("input[name=allow_sms]").is(":checked") ? 1 : 0;
        data.mac = $("input[name=mac]").val();
        data.device = $("input[name=identity]").val();
        data.router = $("input[name=router]").val();
        data.naskey = $("input[name=naskey]").val();
        data.plan_id = $("input[name=plan_id]").val();
        data.ip = $("input[name=ip]").val();
        data.server_name = $("input[name=server_name]").val();
        data.server_address = $("input[name=server_address]").val();
        data.hostname = $("input[name=hostname]").val();
        var voucher = $("input[name=code]").val();

        form.find("button").text("Processing").attr("disabled", "");
        form.find("input[name=phone]").attr("disabled", "");

        // ==========================================================
        // ADD LOG #1 HERE: To see what is being SENT to the server
        // ==========================================================
        console.log("🚀 Sending this data to server:", data);


        const response = await fetch(`${action}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify(data),
        });

        const res = await response.json();
        
        // ===================================================================
        // ADD LOG #2 HERE: To see what is RECEIVED from the server
        // ===================================================================
        console.log("✅ Server Response Received:", res);


        if (!res) {
            $(".gateway-feedback").html(
                `<p class="alert alert-danger">We could not get a valid response from gateway. If you get a prompt, continue with payment.</span>`
            );
            form.find("input[name=phone]").removeAttr("disabled");
        }

        if (res.ResponseCode && res.ResponseCode == 0) {
            $("#pay").text("Processing...").attr("disabled", true);
            $(".gateway-feedback").html(
                `<p class="alert alert-info">Your Payment request has been received. Please fill the M-PESA prompt on your phone to complete this purchase.</p>`
            );

            localStorage.setItem("phone", phone);
            localStorage.setItem("last_purchase", amount);

            let polling_url = $("input[name=mpesa_polling]").val();
            const polling = async (reqid) => {
                const _response = await fetch(polling_url, {
                    method: "POST",
                    body: JSON.stringify({
                        checkout_request_id: `${reqid} `,
                        mac: $("input[name=mac]").val(),
                        device: $("input[name=router]").val(),
                        voucher: $("input[name=code]").val(),
                    }),
                    headers: {
                        "content-type": "application/json",
                        accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                });

                const res = await _response.json();
                let matcher = res.errorCode ? 1 : res.ResultCode;
                var hasCode = res.vcode ? res.vcode : null;

                matcher = res.ResultCode == "4999" ? 1 : matcher;
                res.ResultCode =
                    res.errorCode == "500.001.1001"
                        ? res.errorMessage
                        : res.ResultCode;

                if (
                    res.errorMessage &&
                    res.errorMessage == "This transaction does not exist"
                ) {
                    matcher = 10;
                     res.ResultCode = 10;
                }

                let err_codes = {
                    10: "Unspecified Gateway Error Occured",
                    1037: "Your phone isn't reacheable. Please ensure its unlocked and not pending STK Prompts on your phone",
                    1032: "Ooh No! You have cancelled the transaction.",
                    2001: "Ohh no! You have provided incorrect info to Mpesa Gateway. Don't worry, just retry and use the correct details",
                };

                switch (matcher) {
                    case 0:
                    case "0":
                        let x = 10;
                        setInterval(() => {
                            $(".gateway-feedback").html(
                                `<p class="alert alert-success">Payment received Authorizing device ${
                                    hasCode ? hasCode : voucher
                                }. Connecting you in ${x} seconds. If you're not connected, just click connect or use the transaction number.</p>`
                            );

                            if (x == 0) {
                                voucher = hasCode ? hasCode : voucher;
                                window.location.href = `http://login.wifi/login?username=${voucher}`;
                            }

                            x--;
                        }, 1000);
                        break;

                    case 1:
                    case "1":
                        setTimeout(() => {
                            polling(reqid);
                        }, 4000);
                        break;

                    default:
                        if (!err_codes[res.ResultCode] || !res.ResultDesc) {
                            err_codes[res.ResultCode] = "Gateway Error";
                            res.ResultDesc = "Unkown Error";
                        }

                        $(".gateway-feedback").empty();
                        $(".gateway-feedback").html(
                            `<div class="alert alert-danger"><p>${
                                err_codes[res.ResultCode]
                            }</p><p>${res.ResultDesc}</p></div>`
                        );

                        form.find("input[name=phone]").removeAttr("disabled");
                        form.find("input[name=phone]").removeAttr("disabled");
                        $("#pay")
                            .text(`Pay with ${paymethod}`)
                            .removeAttr("disabled");

                        break;
                }
            };

            polling(res.CheckoutRequestID);
        } else {
            $(".gateway-feedback").html(
                `<p class="alert alert-danger">Payment request failed. Please try again.</p>`
            );
            form.find("input[name=phone]").removeAttr("disabled");
            $("#pay").text(`Pay with ${paymethod}`).removeAttr("disabled");
        }
    });
});

function getCookie(name) {
    return document.cookie.split(";").some((c) => {
        return c.trim().startsWith(name + "=");
    });
}