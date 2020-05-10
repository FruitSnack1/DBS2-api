$('input[name="duration"]').change(() => {
    console.log('cc')
    $('input[name="price"]').val($('input[name="duration"]').val() * 100 + '$')
})