/**
 * Created by C5217649 on 25.02.2016.
 */

$(document).ready(function () {
    $("html").on('change', '.select-view', function(){
        manipulateSelectView($(this));
    });

    $("html").bind("DOMSubtreeModified", function() {
        $(".select-view").each(function(){
            manipulateSelectView($(this));
        });
    });

    function manipulateSelectView(element) {
        const relatedContainerName = element.attr("data-select-view");
        const value = element.val();

        if (relatedContainerName) {
            $("div[data-select-view='" + relatedContainerName + "']").hide();
            $("[data-select-view='" + relatedContainerName + "'][data-select-view-value='" + value + "']").show();
        }
    }
});
