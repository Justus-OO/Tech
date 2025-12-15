$(() => {
    /**
     * Populates the purchase modal with the correct plan details
     * when a "Buy" button is clicked.
     */
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

    /**
     * Handles the "Have Voucher Code?" modal form.
     */
    $(".redeembtn").on("click", async function (e) {
        e.preventDefault();
        const $this = $(this); // Cache the button
        const $input = $("input[name=vrusername]"); // Cache the input
        
        $this.html(`<span class=""><i class="fa fa-spinner fa-spin"></i> please wait...</span>`)
             .attr("disabled", "");

        $(".invalid-feedback, .valid-feedback").empty();
        $input.removeClass("is-invalid is-valid");

        let username = $input.val();

        if (!username) {
            $this.html("Connect").removeAttr("disabled"); // Use a generic "Connect"
            $input.addClass("is-invalid")
                  .after('<span class="invalid-feedback">Please provide the voucher code</span>');
            return;
        }

        try {
            let _request = await fetch(
                $("form[name=check-voucher]").attr("action"),
                {
                    method: "post",
                    body: JSON.stringify({ username }),
                    headers: {
                        "content-type": "application/json",
                        accept: "application/json",
                    },
                }
            );

            let _response = await _request.json();

            if (!_response.success) {
                // Handle API errors (e.g., "voucher not found")
                throw new Error(_response.message);
            }

            // --- Success ---
            $input.addClass("is-valid")
                  .after(
                      `<span class="valid-feedback">${_response.message.replace(
                          "[x]",
                          '<span id="count">10</span>' // Start counter at 10
                      )}.</span>`
                  );
            $this.html("Connect").removeAttr("disabled");

            let _timer = 10;
            const interval = setInterval(() => {
                _timer--;
                $("#count").text(_timer);

                if (_timer <= 0) {
                    clearInterval(interval); // Stop the timer
                    
                    // 1. Get router IP from the hidden field (removes :port)
                    var router_ip = $("input[name=server_address]").val().split(':')[0];
                    
                    // 2. Redirect to the router's login processor
                    window.location.href = `http://${router_ip}/login?username=${_response.code}`;
                }
            }, 1000);

        } catch (error) {
            // Handle network errors or API errors
            $this.html("Connect").removeAttr("disabled");
            $input.addClass("is-invalid")
                  .after(
                      `<span class="fw-bold invalid-feedback">${error.message || "Network error. Please try again."}</span>`
                  );
        }
    });

    /**
     * Handles the "Use Transaction Code" modal form.
     */
    $(".trxvalidate").on("click", async function (e) {
        e.preventDefault();
        const $this = $(this); // Cache the button
        const $textarea = $("textarea[name=transaction]"); // Cache the input

        $this.html(`<span class=""><i class="fa fa-spinner fa-spin"></i> please wait...</span>`)
             .attr("disabled", "");

        $(".invalid-feedback, .valid-feedback").empty();
        $textarea.removeClass("is-invalid is-valid");

        let transaction = $textarea.val();
        let trxsplit = transaction.split(" ")[0]; // Get first part of TRX code

        if (!transaction) {
            $this.html("Connect").removeAttr("disabled");
            $textarea.addClass("is-invalid")
                     .after('<span class="invalid-feedback">Please provide the transaction number</span>');
            return;
        }

        try {
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
            
            if (!_response.success) {
                // Handle API errors (e.g., "transaction not found")
                throw new Error(_response.message);
            }

            // --- Success ---
            $textarea.addClass("is-valid")
                     .after(
                         `<span class="valid-feedback">${_response.message.replace(
                             "[x]",
                             '<span id="count">10</span>' // Start counter at 10
                         )}. You can also use the transaction number as voucher to be connected</span>`
                     );
            $this.html("Connect").removeAttr("disabled");

            let _timer = 10;
            const interval = setInterval(() => {
                _timer--;
                $("#count").text(_timer);

                if (_timer <= 0) {
                    clearInterval(interval); // Stop the timer
                    
                    // 1. Get router IP from the hidden field (removes :port)
                    var router_ip = $("input[name=server_address]").val().split(':')[0];
                    
                    // 2. Redirect to the router's login processor
                    window.location.href = `http://${router_ip}/login?username=${_response.code}`;
                }
            }, 1000);

        } catch (error) {
            // Handle network errors or API errors
            $this.html("Connect").removeAttr("disabled");
            $textarea.addClass("is-invalid")
                     .after(
                         `<span class="fw-bold invalid-feedback">${error.message || "Network error. Please try again."}</span>`
                     );
        }
    });
});