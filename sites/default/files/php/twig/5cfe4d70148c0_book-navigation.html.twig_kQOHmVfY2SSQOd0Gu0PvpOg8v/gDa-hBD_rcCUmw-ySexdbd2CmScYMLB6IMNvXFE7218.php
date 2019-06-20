<?php

use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Markup;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityNotAllowedTagError;
use Twig\Sandbox\SecurityNotAllowedFilterError;
use Twig\Sandbox\SecurityNotAllowedFunctionError;
use Twig\Source;
use Twig\Template;

/* core/themes/classy/templates/navigation/book-navigation.html.twig */
class __TwigTemplate_298a37c29341e7e1239eee8bdc68a673a26338e9c1dda349f6bffa8193a5066f extends \Twig\Template
{
    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = [
        ];
        $this->sandbox = $this->env->getExtension('\Twig\Extension\SandboxExtension');
        $tags = ["if" => 32];
        $filters = ["escape" => 31, "t" => 36];
        $functions = ["attach_library" => 31];

        try {
            $this->sandbox->checkSecurity(
                ['if'],
                ['escape', 't'],
                ['attach_library']
            );
        } catch (SecurityError $e) {
            $e->setSourceContext($this->getSourceContext());

            if ($e instanceof SecurityNotAllowedTagError && isset($tags[$e->getTagName()])) {
                $e->setTemplateLine($tags[$e->getTagName()]);
            } elseif ($e instanceof SecurityNotAllowedFilterError && isset($filters[$e->getFilterName()])) {
                $e->setTemplateLine($filters[$e->getFilterName()]);
            } elseif ($e instanceof SecurityNotAllowedFunctionError && isset($functions[$e->getFunctionName()])) {
                $e->setTemplateLine($functions[$e->getFunctionName()]);
            }

            throw $e;
        }

    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        // line 31
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->env->getExtension('Drupal\Core\Template\TwigExtension')->attachLibrary("classy/book-navigation"), "html", null, true);
        echo "
";
        // line 32
        if ((($context["tree"] ?? null) || ($context["has_links"] ?? null))) {
            // line 33
            echo "  <nav id=\"book-navigation-";
            echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["book_id"] ?? null)), "html", null, true);
            echo "\" class=\"book-navigation\" role=\"navigation\" aria-labelledby=\"book-label-";
            echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["book_id"] ?? null)), "html", null, true);
            echo "\">
    ";
            // line 34
            echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["tree"] ?? null)), "html", null, true);
            echo "
    ";
            // line 35
            if (($context["has_links"] ?? null)) {
                // line 36
                echo "      <h2 class=\"visually-hidden\" id=\"book-label-";
                echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["book_id"] ?? null)), "html", null, true);
                echo "\">";
                echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->renderVar(t("Book traversal links for"));
                echo " ";
                echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["book_title"] ?? null)), "html", null, true);
                echo "</h2>
      <ul class=\"book-pager\">
      ";
                // line 38
                if (($context["prev_url"] ?? null)) {
                    // line 39
                    echo "        <li class=\"book-pager__item book-pager__item--previous\">
          <a href=\"";
                    // line 40
                    echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["prev_url"] ?? null)), "html", null, true);
                    echo "\" rel=\"prev\" title=\"";
                    echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->renderVar(t("Go to previous page"));
                    echo "\"><b>";
                    echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->renderVar(t("‹"));
                    echo "</b> ";
                    echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["prev_title"] ?? null)), "html", null, true);
                    echo "</a>
        </li>
      ";
                }
                // line 43
                echo "      ";
                if (($context["parent_url"] ?? null)) {
                    // line 44
                    echo "        <li class=\"book-pager__item book-pager__item--center\">
          <a href=\"";
                    // line 45
                    echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["parent_url"] ?? null)), "html", null, true);
                    echo "\" title=\"";
                    echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->renderVar(t("Go to parent page"));
                    echo "\">";
                    echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->renderVar(t("Up"));
                    echo "</a>
        </li>
      ";
                }
                // line 48
                echo "      ";
                if (($context["next_url"] ?? null)) {
                    // line 49
                    echo "        <li class=\"book-pager__item book-pager__item--next\">
          <a href=\"";
                    // line 50
                    echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["next_url"] ?? null)), "html", null, true);
                    echo "\" rel=\"next\" title=\"";
                    echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->renderVar(t("Go to next page"));
                    echo "\">";
                    echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["next_title"] ?? null)), "html", null, true);
                    echo " <b>";
                    echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->renderVar(t("›"));
                    echo "</b></a>
        </li>
      ";
                }
                // line 53
                echo "    </ul>
    ";
            }
            // line 55
            echo "  </nav>
";
        }
    }

    public function getTemplateName()
    {
        return "core/themes/classy/templates/navigation/book-navigation.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  139 => 55,  135 => 53,  123 => 50,  120 => 49,  117 => 48,  107 => 45,  104 => 44,  101 => 43,  89 => 40,  86 => 39,  84 => 38,  74 => 36,  72 => 35,  68 => 34,  61 => 33,  59 => 32,  55 => 31,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Source("", "core/themes/classy/templates/navigation/book-navigation.html.twig", "C:\\Users\\ibrahim\\Sites\\devdesktop\\drupal-8.7.1\\core\\themes\\classy\\templates\\navigation\\book-navigation.html.twig");
    }
}
