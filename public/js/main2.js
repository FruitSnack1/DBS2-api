$('select[name="duration"]').change(() => {
    console.log('cc')
    $('input[name="price"]').val($('select[name="duration"]').val() * 100 + '$')
})