<template>
    <div id="expression_bar">
        <i class="fas fa-code"></i>
        <input type="text">
    </div>
</template>

<script>
import $ from 'jquery'

const ExpandedInput = {
    input: 0,
    axis: null,
    setup() {
        ExpandedInput.obj = $('#expression_bar input')
        .on('input', function(e) {
            if (!ExpandedInput.input) return;
            var val = $(this).val()
            var input = ExpandedInput.input;
            if (input.axis_count > 1 || input.type == 'list') {
                var arr = [];
                for (var i = 0; i < input.axis_count; i++) {
                    arr[i] = (i == ExpandedInput.axis) ? val : input.value[i];
                }
                input.set(arr)
            } else {
                input.value = val;
            }
        })
    }
}

export default {
    name: 'expression-bar',
	mounted() {
		ExpandedInput.setup()
	}
}
export {ExpandedInput}

</script>

<style scoped>
	#expression_bar {
		width: 100%;
		height: 32px;
		background-color: var(--color-background);
		color: white;
	}
	#expression_bar i {
		text-align: center;
		width: 40px;
		padding-top: 7px;
		float: left;
		opacity: 0.8;
	}
	#expression_bar input {
		background-color: transparent;
		width: calc(100% - 40px);
		border: none;
		height: 32px;
		padding: 5px 8px;
		opacity: 0.8;
		float: left;
		color: white;
	}
	#expression_bar input:focus {
		opacity: 1;
	}
</style>>
