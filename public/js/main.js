$('select[name="duration"]').change(() => {
    $('input[name="price"]').val($('select[name="duration"]').val() * 100 + 'Kč')
})