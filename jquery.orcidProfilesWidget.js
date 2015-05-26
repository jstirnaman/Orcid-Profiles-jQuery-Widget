var $jq = jQuery.noConflict()
$jq(document).ready(function () {
    var widget = $jq('#orcid-profiles-widget-js').clone(),
        orcids = widget.data(orcids).orcids.split(","),
        profile = null;
    $jq(orcids).each(function (name, value) {
        var profile_promise = get_orcid_profile(value.trim())
            profile_promise.success(function (data) {
            profile = data['orcid-profile']
            widget.append(set_widget_content(profile))
            sort_profiles(widget) 
        })
    })
    
    $jq('#orcid-profiles-widget-js').replaceWith(widget)
    function sort_profiles(wrapper) {
      list = $jq(wrapper).children('.orcid-profile')
      list.sort(function(a, b) {
        if($jq(a).data('familyname') < $jq(b).data('familyname')) { return -1 }
        if($jq(a).data('familyname') > $jq(b).data('familyname')) { return 1 }
         return 0
      })
       return list.detach().appendTo(wrapper)
    }
    
    function set_widget_content() {
        var profile_div = $jq('<div class="orcid-profile">')
        profile_div.attr('data-name', person_name())
        profile_div.attr('data-familyname', profile['orcid-bio']['personal-details']['family-name'].value)
        set_bio().appendTo(profile_div)
        set_person_works().appendTo(profile_div)
        var orcid_uri = profile['orcid-identifier']['uri']
        var orcid_link = $jq("<a>")
        orcid_link.addClass("orcid-uri")
        orcid_link.attr("href", orcid_uri)
        orcid_link.text("View full profile at ORCID")
        orcid_link = orcid_link.appendTo("<span class='orcid-uri'>")
        orcid_link.appendTo(profile_div)
        return profile_div
    }

    function get_orcid_profile(orcid) {
        var profile_uri = 'http://pub.orcid.org/v1.1/' + orcid + '/orcid-profile';
        return $jq.ajax({
            url: profile_uri,
            type: 'GET',
            dataType: 'jsonp',
            accepts: 'application/orcid+json'
        })
    }

    function set_bio() {
        var data = profile['orcid-bio']
        var name = person_name(data);
        var name_span = $jq('<span class="credit-name">');
        $jq('<h1>' + name + '</h1>').appendTo(name_span);
        var bio_span = $jq('<span class="orcid-bio">');
        name_span.appendTo(bio_span);
        return bio_span
    }

    function set_person_works() {
        var data = profile['orcid-activities']
        var span = $jq('<span class="orcid-works">');
        $jq('<h2>Works</h2>').appendTo(span);
        if (data['orcid-works']) {
            var works = data['orcid-works']['orcid-work'];
            span.append(list_person_works(works));
        } else {
            span.text("No works found.");
        }
        return span
    }

    function list_person_works(works) {
        var ul = $jq('<ul class="orcid-works">');
        $jq(works).each(function (index, value) {
            var title = value['work-title']['title'].value;
            var li = $jq('<li class="orcid-work">');
            var extids = value['work-external-identifiers'] != null ? value['work-external-identifiers']['work-external-identifier'] : "";
            var href = "";
            $jq(extids).each(function (index, value) {
                if (value['work-external-identifier-type'] === "DOI") {
                    href = "http://dx.doi.org/";
                    href += value['work-external-identifier-id'].value;
                }
            });
            if (href != "") {
                var a = $jq('<a class="orcid-work">');
                a.attr("href", href);
                a.text(title);
                a.appendTo(li);
            } else {
                li.text(title);
            }
            li.appendTo(ul);
        });
        return ul
    }

    function person_name() {
        var data = profile['orcid-bio']
        var name = data['personal-details']['credit-name']
        if (name) {
            name = name.value
        } else {
            name = data['personal-details']['given-names'].value + " " + data['personal-details']['family-name'].value;
        }
        return name
    }
});
